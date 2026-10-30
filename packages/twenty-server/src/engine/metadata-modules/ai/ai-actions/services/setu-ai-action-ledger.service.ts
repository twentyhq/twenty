import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { randomUUID } from 'crypto';

import {
  type SetuAiActionProjection,
  type SetuAiActionReceipt,
  type SetuAiActionStatus,
  type SetuAiErrorCode,
} from 'twenty-shared/ai';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { type EntityManager, In, LessThan, type Repository } from 'typeorm';

import { SETU_AI_ACTION_APPROVAL_TTL_MS } from 'src/engine/metadata-modules/ai/ai-actions/constants/setu-ai-action-approval-ttl-ms.constant';
import { SETU_AI_ACTION_LEASE_DURATION_MS } from 'src/engine/metadata-modules/ai/ai-actions/constants/setu-ai-action-lease-duration-ms.constant';
import { SETU_AI_ACTION_POLICY_VERSION } from 'src/engine/metadata-modules/ai/ai-actions/constants/setu-ai-action-policy-version.constant';
import { SetuAiActionAttemptEntity } from 'src/engine/metadata-modules/ai/ai-actions/entities/setu-ai-action-attempt.entity';
import { SetuAiActionRequestEntity } from 'src/engine/metadata-modules/ai/ai-actions/entities/setu-ai-action-request.entity';
import { SetuAiActionException } from 'src/engine/metadata-modules/ai/ai-actions/setu-ai-action.exception';
import { type PreparedSetuAiAction } from 'src/engine/metadata-modules/ai/ai-actions/types/prepared-setu-ai-action.type';
import { type SetuAiActionAttemptOutcome } from 'src/engine/metadata-modules/ai/ai-actions/types/setu-ai-action-attempt-outcome.type';
import { computeSetuAiActionPayloadHash } from 'src/engine/metadata-modules/ai/ai-actions/utils/compute-setu-ai-action-payload-hash.util';
import { toSetuAiActionProjection } from 'src/engine/metadata-modules/ai/ai-actions/utils/to-setu-ai-action-projection.util';

type ActionOwner = { workspaceId: string; userWorkspaceId: string };

export type SetuAiActionProjectionResult =
  | { requestedId: string; status: 'available'; action: SetuAiActionProjection }
  | { requestedId: string; status: 'unavailable' };

// The approval ledger. Every transition is a compare-and-set on
// stateVersion inside a transaction holding the row lock, so a decision, an
// edit and a worker claim can never interleave. Redis jobs only ever point
// at rows here; this table is the source of truth.
@Injectable()
export class SetuAiActionLedgerService {
  // Unscoped on purpose: the dispatcher scans every workspace and worker
  // claims address rows by id. Every caller-facing query filters on the
  // owner's workspaceId explicitly.
  constructor(
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(SetuAiActionRequestEntity)
    private readonly actionRequestRepository: Repository<SetuAiActionRequestEntity>,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(SetuAiActionAttemptEntity)
    private readonly actionAttemptRepository: Repository<SetuAiActionAttemptEntity>,
  ) {}

  async createProposal({
    owner,
    threadId,
    taskId = null,
    deduplicationKey,
    prepared,
  }: {
    owner: ActionOwner;
    threadId: string | null;
    taskId?: string | null;
    deduplicationKey: string;
    prepared: PreparedSetuAiAction;
  }): Promise<SetuAiActionRequestEntity> {
    const existing = await this.actionRequestRepository.findOne({
      where: { workspaceId: owner.workspaceId, deduplicationKey },
    });

    if (isDefined(existing)) {
      return existing;
    }

    try {
      return await this.actionRequestRepository.save(
        this.actionRequestRepository.create({
          ...this.buildRevisionFields({ owner, prepared }),
          threadId,
          taskId,
          deduplicationKey,
          logicalActionId: randomUUID(),
          revision: 1,
        }),
      );
    } catch (error) {
      // A concurrent retry of the same tool call won the insert.
      const raced = await this.actionRequestRepository.findOne({
        where: { workspaceId: owner.workspaceId, deduplicationKey },
      });

      if (isDefined(raced)) {
        return raced;
      }

      throw error;
    }
  }

  // The previous revision is superseded in the same transaction that creates
  // the new one, and only while no worker holds it, so an edit can never race
  // a queued send into sending the unapproved version.
  async createRevision({
    owner,
    actionRequestId,
    expectedStateVersion,
    deduplicationKey,
    prepared,
  }: {
    owner: ActionOwner;
    actionRequestId: string;
    expectedStateVersion: number;
    deduplicationKey: string;
    prepared: PreparedSetuAiAction;
  }): Promise<SetuAiActionRequestEntity> {
    const existing = await this.actionRequestRepository.findOne({
      where: { workspaceId: owner.workspaceId, deduplicationKey },
    });

    if (isDefined(existing)) {
      return existing;
    }

    return this.actionRequestRepository.manager.transaction(async (manager) => {
      const previous = await this.lockOwnedAction(
        manager,
        owner,
        actionRequestId,
      );

      if (previous.kind !== prepared.kind) {
        throw new SetuAiActionException(
          'A revision cannot change the action kind',
          'INVALID_INPUT',
        );
      }

      if (
        previous.status === 'running' ||
        previous.status === 'delivery_unknown'
      ) {
        throw new SetuAiActionException(
          'Action already started',
          'ACTION_ALREADY_STARTED',
        );
      }

      this.assertStateVersion(previous, expectedStateVersion);

      if (
        previous.status !== 'pending_review' &&
        previous.status !== 'queued'
      ) {
        throw new SetuAiActionException(
          'Action not revisable',
          'NOT_REVIEWABLE',
        );
      }

      await manager.update(
        SetuAiActionRequestEntity,
        { id: previous.id },
        {
          status: 'superseded',
          stateVersion: previous.stateVersion + 1,
        },
      );

      const repository = manager.getRepository(SetuAiActionRequestEntity);

      return repository.save(
        repository.create({
          ...this.buildRevisionFields({ owner, prepared }),
          threadId: previous.threadId,
          taskId: previous.taskId,
          deduplicationKey,
          logicalActionId: previous.logicalActionId,
          revision: previous.revision + 1,
        }),
      );
    });
  }

  async decide({
    owner,
    actionRequestId,
    expectedStateVersion,
    decision,
    clientRequestId,
  }: {
    owner: ActionOwner;
    actionRequestId: string;
    expectedStateVersion: number;
    decision: 'approve' | 'reject';
    clientRequestId: string;
  }): Promise<SetuAiActionRequestEntity> {
    const outcome = await this.actionRequestRepository.manager.transaction(
      async (manager) => {
        const action = await this.lockOwnedAction(
          manager,
          owner,
          actionRequestId,
        );

        // A retried decision returns the outcome it already established.
        if (action.decisionRequestId === clientRequestId) {
          return { action, isExpired: false };
        }

        this.assertStateVersion(action, expectedStateVersion);

        if (action.status !== 'pending_review') {
          throw new SetuAiActionException(
            'Action not reviewable',
            'NOT_REVIEWABLE',
          );
        }

        // Recorded as expired and committed before the caller hears why.
        if (
          isDefined(action.expiresAt) &&
          action.expiresAt.getTime() <= Date.now()
        ) {
          return {
            action: await this.transition(manager, action, {
              status: 'expired',
              errorCode: 'APPROVAL_EXPIRED',
            }),
            isExpired: true,
          };
        }

        return {
          action: await this.transition(manager, action, {
            status: decision === 'approve' ? 'queued' : 'rejected',
            decidedByUserWorkspaceId: owner.userWorkspaceId,
            decidedAt: new Date(),
            decisionRequestId: clientRequestId,
          }),
          isExpired: false,
        };
      },
    );

    if (outcome.isExpired) {
      throw new SetuAiActionException('Approval expired', 'APPROVAL_EXPIRED');
    }

    return outcome.action;
  }

  async cancel({
    owner,
    actionRequestId,
    expectedStateVersion,
    clientRequestId,
  }: {
    owner: ActionOwner;
    actionRequestId: string;
    expectedStateVersion: number;
    clientRequestId: string;
  }): Promise<SetuAiActionRequestEntity> {
    return this.actionRequestRepository.manager.transaction(async (manager) => {
      const action = await this.lockOwnedAction(
        manager,
        owner,
        actionRequestId,
      );

      if (
        action.status === 'cancelled' &&
        action.decisionRequestId === clientRequestId
      ) {
        return action;
      }

      // A worker's claim bumps the version too, so "already started" is
      // reported before a version mismatch: it is the actionable answer.
      if (action.status === 'running' || action.status === 'delivery_unknown') {
        throw new SetuAiActionException(
          'Action already started',
          'ACTION_ALREADY_STARTED',
        );
      }

      this.assertStateVersion(action, expectedStateVersion);

      if (action.status !== 'queued') {
        throw new SetuAiActionException(
          'Action not cancellable',
          'NOT_REVIEWABLE',
        );
      }

      return this.transition(manager, action, {
        status: 'cancelled',
        decisionRequestId: clientRequestId,
      });
    });
  }

  // Inaccessible, foreign and missing ids all read the same, so a caller
  // learns nothing about actions that are not theirs. A superseded id shows
  // the logical action's current revision, whose revision number changed.
  async findProjections({
    owner,
    actionRequestIds,
  }: {
    owner: ActionOwner;
    actionRequestIds: string[];
  }): Promise<SetuAiActionProjectionResult[]> {
    const validIds = actionRequestIds.filter(isValidUuid);
    const requested =
      validIds.length > 0
        ? await this.actionRequestRepository.find({
            where: { id: In(validIds), workspaceId: owner.workspaceId },
          })
        : [];
    const ownedById = new Map(
      requested
        .filter(
          (action) => action.initiatorUserWorkspaceId === owner.userWorkspaceId,
        )
        .map((action) => [action.id, action]),
    );
    const logicalActionIds = [
      ...new Set(
        [...ownedById.values()].map((action) => action.logicalActionId),
      ),
    ];
    const latestRevisions =
      logicalActionIds.length > 0
        ? await this.actionRequestRepository.find({
            where: {
              workspaceId: owner.workspaceId,
              logicalActionId: In(logicalActionIds),
            },
            order: { revision: 'DESC' },
          })
        : [];
    const latestByLogicalActionId = new Map<
      string,
      SetuAiActionRequestEntity
    >();

    for (const revision of latestRevisions) {
      if (!latestByLogicalActionId.has(revision.logicalActionId)) {
        latestByLogicalActionId.set(revision.logicalActionId, revision);
      }
    }

    return actionRequestIds.map((requestedId) => {
      const action = ownedById.get(requestedId);
      const current = isDefined(action)
        ? (latestByLogicalActionId.get(action.logicalActionId) ?? action)
        : undefined;

      return isDefined(current)
        ? {
            requestedId,
            status: 'available',
            action: toSetuAiActionProjection(current),
          }
        : { requestedId, status: 'unavailable' };
    });
  }

  async findOwnedAction(
    owner: ActionOwner,
    actionRequestId: string,
  ): Promise<SetuAiActionRequestEntity> {
    const action = isValidUuid(actionRequestId)
      ? await this.actionRequestRepository.findOne({
          where: { id: actionRequestId, workspaceId: owner.workspaceId },
        })
      : null;

    if (
      !isDefined(action) ||
      action.initiatorUserWorkspaceId !== owner.userWorkspaceId
    ) {
      throw new SetuAiActionException('Action not available', 'NOT_AVAILABLE');
    }

    return action;
  }

  async findById(
    actionRequestId: string,
  ): Promise<SetuAiActionRequestEntity | null> {
    return this.actionRequestRepository.findOne({
      where: { id: actionRequestId },
    });
  }

  // Only one worker can move a row from queued to running; the fencing token
  // it receives must accompany every later write from that worker.
  async claim({
    actionRequestId,
    leaseOwner,
  }: {
    actionRequestId: string;
    leaseOwner: string;
  }): Promise<SetuAiActionRequestEntity | null> {
    const result = await this.actionRequestRepository
      .createQueryBuilder()
      .update(SetuAiActionRequestEntity)
      .set({
        status: 'running',
        leaseOwner,
        leaseExpiresAt: () =>
          `now() + interval '${SETU_AI_ACTION_LEASE_DURATION_MS} milliseconds'`,
        fencingToken: () => '"fencingToken" + 1',
        stateVersion: () => '"stateVersion" + 1',
      })
      .where('id = :actionRequestId AND status = :status', {
        actionRequestId,
        status: 'queued',
      })
      .returning('*')
      .execute();

    const [row] = (result.raw ?? []) as SetuAiActionRequestEntity[];

    return isDefined(row) ? this.actionRequestRepository.create(row) : null;
  }

  async finishRun({
    action,
    status,
    errorCode = null,
    receipt = null,
  }: {
    action: SetuAiActionRequestEntity;
    status: SetuAiActionStatus;
    errorCode?: SetuAiErrorCode | null;
    receipt?: SetuAiActionReceipt | null;
  }): Promise<boolean> {
    const result = await this.actionRequestRepository
      .createQueryBuilder()
      .update(SetuAiActionRequestEntity)
      .set({
        status,
        errorCode,
        receipt,
        leaseOwner: null,
        leaseExpiresAt: null,
        stateVersion: () => '"stateVersion" + 1',
      })
      .where(
        'id = :id AND status = :running AND "fencingToken" = :fencingToken',
        {
          id: action.id,
          running: 'running',
          fencingToken: action.fencingToken,
        },
      )
      .execute();

    return (result.affected ?? 0) === 1;
  }

  async startAttempt(
    action: SetuAiActionRequestEntity,
  ): Promise<SetuAiActionAttemptEntity> {
    const attemptCount = await this.actionAttemptRepository.count({
      where: { actionRequestId: action.id },
    });

    return this.actionAttemptRepository.save(
      this.actionAttemptRepository.create({
        workspaceId: action.workspaceId,
        actionRequestId: action.id,
        attemptNumber: attemptCount + 1,
        fencingToken: action.fencingToken,
        outcome: 'started',
      }),
    );
  }

  async finishAttempt({
    attempt,
    outcome,
    errorCode = null,
    providerCorrelationId = null,
    sanitizedResult = null,
  }: {
    attempt: SetuAiActionAttemptEntity;
    outcome: SetuAiActionAttemptOutcome;
    errorCode?: SetuAiErrorCode | null;
    providerCorrelationId?: string | null;
    sanitizedResult?: SetuAiActionReceipt | null;
  }): Promise<void> {
    await this.actionAttemptRepository.update(
      { id: attempt.id },
      {
        outcome,
        errorCode,
        providerCorrelationId,
        sanitizedResult,
        finishedAt: new Date(),
      },
    );
  }

  async findStartedAttempt(
    actionRequestId: string,
  ): Promise<SetuAiActionAttemptEntity | null> {
    return this.actionAttemptRepository.findOne({
      where: { actionRequestId, outcome: 'started' },
      order: { attemptNumber: 'DESC' },
    });
  }

  async findQueuedActionIds(
    limit: number,
  ): Promise<Pick<SetuAiActionRequestEntity, 'id' | 'workspaceId'>[]> {
    return this.actionRequestRepository.find({
      select: { id: true, workspaceId: true },
      where: { status: 'queued' },
      order: { updatedAt: 'ASC' },
      take: limit,
    });
  }

  async findRunningWithExpiredLease(
    limit: number,
  ): Promise<SetuAiActionRequestEntity[]> {
    return this.actionRequestRepository.find({
      where: { status: 'running', leaseExpiresAt: LessThan(new Date()) },
      take: limit,
    });
  }

  async expirePendingReviews(): Promise<number> {
    const result = await this.actionRequestRepository
      .createQueryBuilder()
      .update(SetuAiActionRequestEntity)
      .set({
        status: 'expired',
        errorCode: 'APPROVAL_EXPIRED',
        stateVersion: () => '"stateVersion" + 1',
      })
      .where('status = :status AND "expiresAt" < now()', {
        status: 'pending_review',
      })
      .execute();

    return result.affected ?? 0;
  }

  // Used only by reconciliation for a run whose worker vanished: it moves an
  // expired lease to the outcome the evidence supports.
  async resolveAbandonedRun({
    action,
    status,
    errorCode = null,
    receipt = null,
  }: {
    action: SetuAiActionRequestEntity;
    status: SetuAiActionStatus;
    errorCode?: SetuAiErrorCode | null;
    receipt?: SetuAiActionReceipt | null;
  }): Promise<boolean> {
    const result = await this.actionRequestRepository
      .createQueryBuilder()
      .update(SetuAiActionRequestEntity)
      .set({
        status,
        errorCode,
        receipt,
        leaseOwner: null,
        leaseExpiresAt: null,
        stateVersion: () => '"stateVersion" + 1',
      })
      .where(
        'id = :id AND status = :running AND "fencingToken" = :fencingToken AND "leaseExpiresAt" < now()',
        {
          id: action.id,
          running: 'running',
          fencingToken: action.fencingToken,
        },
      )
      .execute();

    return (result.affected ?? 0) === 1;
  }

  private buildRevisionFields({
    owner,
    prepared,
  }: {
    owner: ActionOwner;
    prepared: PreparedSetuAiAction;
  }): Partial<SetuAiActionRequestEntity> {
    return {
      workspaceId: owner.workspaceId,
      initiatorUserWorkspaceId: owner.userWorkspaceId,
      kind: prepared.kind,
      payload: prepared.payload,
      payloadHash: computeSetuAiActionPayloadHash({
        kind: prepared.kind,
        payload: prepared.payload,
      }),
      preconditions: prepared.preconditions,
      status: 'pending_review',
      stateVersion: 1,
      policyVersion: SETU_AI_ACTION_POLICY_VERSION,
      expiresAt: new Date(Date.now() + SETU_AI_ACTION_APPROVAL_TTL_MS),
    };
  }

  private async lockOwnedAction(
    manager: EntityManager,
    owner: ActionOwner,
    actionRequestId: string,
  ): Promise<SetuAiActionRequestEntity> {
    const action = await manager
      .getRepository(SetuAiActionRequestEntity)
      .createQueryBuilder('action')
      .setLock('pessimistic_write')
      .where(
        'action.id = :actionRequestId AND action.workspaceId = :workspaceId',
        {
          actionRequestId,
          workspaceId: owner.workspaceId,
        },
      )
      .getOne();

    if (
      !isDefined(action) ||
      action.initiatorUserWorkspaceId !== owner.userWorkspaceId
    ) {
      throw new SetuAiActionException('Action not available', 'NOT_AVAILABLE');
    }

    return action;
  }

  private assertStateVersion(
    action: SetuAiActionRequestEntity,
    expectedStateVersion: number,
  ): void {
    if (action.stateVersion !== expectedStateVersion) {
      throw new SetuAiActionException('Stale action version', 'STALE_VERSION');
    }
  }

  private async transition(
    manager: EntityManager,
    action: SetuAiActionRequestEntity,
    changes: Partial<
      Pick<
        SetuAiActionRequestEntity,
        | 'status'
        | 'errorCode'
        | 'decidedByUserWorkspaceId'
        | 'decidedAt'
        | 'decisionRequestId'
      >
    >,
  ): Promise<SetuAiActionRequestEntity> {
    const updated = { ...changes, stateVersion: action.stateVersion + 1 };

    await manager.update(SetuAiActionRequestEntity, { id: action.id }, updated);

    return manager
      .getRepository(SetuAiActionRequestEntity)
      .merge(action, updated);
  }
}
