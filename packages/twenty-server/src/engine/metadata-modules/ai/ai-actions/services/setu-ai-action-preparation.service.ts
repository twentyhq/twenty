import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString, isString } from '@sniptt/guards';
import {
  type SetuRecordFieldChange,
  type SetuSendEmailActionPayload,
} from 'twenty-shared/ai';
import { EmailOperation } from 'twenty-shared/types';
import {
  canConnectedAccountPerformEmailOperation,
  isDefined,
  isValidUuid,
} from 'twenty-shared/utils';
import { IsNull, type Repository } from 'typeorm';

import { selectConnectedAccountIdForCaller } from 'src/engine/core-modules/tool/tools/email-tool/utils/select-connected-account-id-for-caller.util';
import { SETU_AI_EMAIL_LIMITS } from 'src/engine/metadata-modules/ai/ai-actions/constants/setu-ai-email-limits.constant';
import { SETU_AI_RECORD_UPDATE_FIELD_TYPES } from 'src/engine/metadata-modules/ai/ai-actions/constants/setu-ai-record-update-field-types.constant';
import { SetuAiActionException } from 'src/engine/metadata-modules/ai/ai-actions/setu-ai-action.exception';
import { type PreparedSetuAiAction } from 'src/engine/metadata-modules/ai/ai-actions/types/prepared-setu-ai-action.type';
import { type SetuAiActionActor } from 'src/engine/metadata-modules/ai/ai-actions/types/setu-ai-action-actor.type';
import {
  type SetuAiActionProposalInput,
  type SetuSendEmailActionInput,
  type SetuUpdateRecordFieldsActionInput,
} from 'src/engine/metadata-modules/ai/ai-actions/types/setu-ai-action-proposal-input.type';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { isConnectedAccountUsableByCaller } from 'src/engine/metadata-modules/connected-account/utils/is-connected-account-usable-by-caller.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

const EMAIL_ADDRESS_PATTERN =
  /^[^\s@<>(),;:"]+@[^\s@<>(),;:"]+\.[^\s@<>(),;:"]+$/;

const toAddressList = (value: string[] | string | undefined): string[] => {
  const items = Array.isArray(value) ? value : (value ?? '').split(',');

  return [
    ...new Set(
      items
        .filter(isString)
        .map((item) => item.trim().toLowerCase())
        .filter((item) => item.length > 0),
    ),
  ];
};

// Turns a proposal into the exact revision a reviewer will approve: the
// sender account, recipients and record values are resolved and frozen here,
// with the proposing person's own permissions.
@Injectable()
export class SetuAiActionPreparationService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
  ) {}

  async prepare(
    input: SetuAiActionProposalInput,
    actor: SetuAiActionActor,
  ): Promise<PreparedSetuAiAction> {
    switch (input.kind) {
      case 'send_email':
        return this.prepareSendEmail(input.sendEmail, actor);
      case 'update_record_fields':
        return this.prepareRecordUpdate(input.updateRecordFields, actor);
      default:
        throw new SetuAiActionException(
          'Unsupported action kind',
          'UNSUPPORTED_ACTION',
        );
    }
  }

  async findUsableSenderAccount({
    connectedAccountId,
    actor,
  }: {
    connectedAccountId?: string;
    actor: Pick<SetuAiActionActor, 'workspaceId' | 'userWorkspaceId'>;
  }): Promise<ConnectedAccountEntity | undefined> {
    const accounts = await this.connectedAccountRepository.find({
      where: { workspaceId: actor.workspaceId, archivedAt: IsNull() },
      order: { createdAt: 'ASC', id: 'ASC' },
    });

    const usableAccounts = accounts.filter(
      (connectedAccount) =>
        isConnectedAccountUsableByCaller({
          connectedAccount,
          userWorkspaceId: actor.userWorkspaceId,
        }) &&
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: EmailOperation.SEND,
        }),
    );

    const selectedId = isNonEmptyString(connectedAccountId)
      ? connectedAccountId
      : selectConnectedAccountIdForCaller({
          connectedAccounts: usableAccounts,
          userWorkspaceId: actor.userWorkspaceId,
        });

    return usableAccounts.find((account) => account.id === selectedId);
  }

  private async prepareSendEmail(
    input: SetuSendEmailActionInput,
    actor: SetuAiActionActor,
  ): Promise<PreparedSetuAiAction> {
    const to = toAddressList(input.to);
    const cc = toAddressList(input.cc);
    const bcc = toAddressList(input.bcc);
    const subject = (input.subject ?? '').trim();
    const body = (input.body ?? '').trim();
    const allRecipients = [...to, ...cc, ...bcc];

    if (
      to.length === 0 ||
      allRecipients.length > SETU_AI_EMAIL_LIMITS.maxRecipients ||
      allRecipients.some((address) => !EMAIL_ADDRESS_PATTERN.test(address))
    ) {
      throw new SetuAiActionException(
        'An email needs at least one valid To address and valid copies only',
        'INVALID_INPUT',
      );
    }

    if (
      subject.length === 0 ||
      subject.length > SETU_AI_EMAIL_LIMITS.maxSubjectLength ||
      body.length === 0 ||
      body.length > SETU_AI_EMAIL_LIMITS.maxBodyLength
    ) {
      throw new SetuAiActionException(
        'An email needs a short subject and a body',
        'INVALID_INPUT',
      );
    }

    const senderAccount = await this.findUsableSenderAccount({
      connectedAccountId: input.connectedAccountId,
      actor,
    });

    if (!isDefined(senderAccount)) {
      throw new SetuAiActionException(
        'No email account this person can send from',
        'ACCOUNT_UNAVAILABLE',
      );
    }

    const payload: SetuSendEmailActionPayload = {
      connectedAccountId: senderAccount.id,
      senderHandle: senderAccount.handle,
      to,
      cc,
      bcc,
      subject,
      body,
    };

    return { kind: 'send_email', payload, preconditions: {} };
  }

  private async prepareRecordUpdate(
    input: SetuUpdateRecordFieldsActionInput,
    actor: SetuAiActionActor,
  ): Promise<PreparedSetuAiAction> {
    const fieldNames = Object.keys(input.fields ?? {});

    if (
      !isNonEmptyString(input.objectNameSingular) ||
      !isValidUuid(input.recordId ?? '') ||
      fieldNames.length === 0
    ) {
      throw new SetuAiActionException(
        'A record update needs an object, a record id and at least one field',
        'INVALID_INPUT',
      );
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const {
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectIdByNameSingular,
      } = getWorkspaceContext();
      const objectMetadataId = objectIdByNameSingular[input.objectNameSingular];
      const objectMetadata = isDefined(objectMetadataId)
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityMaps: flatObjectMetadataMaps,
            flatEntityId: objectMetadataId,
          })
        : undefined;

      if (!isDefined(objectMetadata) || objectMetadata.isSystem) {
        throw new SetuAiActionException(
          'This record cannot be updated from chat',
          'UNSUPPORTED_ACTION',
        );
      }

      const fieldsByName = new Map(
        Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
          .filter(
            (fieldMetadata) =>
              isDefined(fieldMetadata) &&
              fieldMetadata.objectMetadataId === objectMetadata.id,
          )
          .map((fieldMetadata) => [fieldMetadata!.name, fieldMetadata!]),
      );

      for (const fieldName of fieldNames) {
        const fieldMetadata = fieldsByName.get(fieldName);

        if (
          !isDefined(fieldMetadata) ||
          fieldMetadata.isSystem === true ||
          fieldMetadata.isActive === false ||
          !SETU_AI_RECORD_UPDATE_FIELD_TYPES.has(fieldMetadata.type)
        ) {
          throw new SetuAiActionException(
            `Field ${fieldName} cannot be updated from chat`,
            'UNSUPPORTED_ACTION',
          );
        }
      }

      // Read with the person's own permissions: a record they cannot see
      // fails like a missing one.
      let record: Record<string, unknown> | null = null;

      try {
        record = await this.workspaceOrmManager
          .getRepository(input.objectNameSingular, actor.rolePermissionConfig)
          .findOne({ where: { id: input.recordId } });
      } catch {
        record = null;
      }

      if (!isDefined(record)) {
        throw new SetuAiActionException(
          'Record not available',
          'NOT_AVAILABLE',
        );
      }

      const changes: SetuRecordFieldChange[] = fieldNames
        .map((fieldName) => ({
          fieldName,
          fieldLabel: fieldsByName.get(fieldName)!.label,
          before: record![fieldName] ?? null,
          after: input.fields[fieldName] ?? null,
        }))
        .filter(
          (change) =>
            JSON.stringify(change.before) !== JSON.stringify(change.after),
        );

      if (changes.length === 0) {
        throw new SetuAiActionException(
          'The record already has these values',
          'INVALID_INPUT',
        );
      }

      const labelIdentifierFieldName = isDefined(
        objectMetadata.labelIdentifierFieldMetadataId,
      )
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityMaps: flatFieldMetadataMaps,
            flatEntityId: objectMetadata.labelIdentifierFieldMetadataId,
          })?.name
        : undefined;
      const labelValue = isDefined(labelIdentifierFieldName)
        ? record[labelIdentifierFieldName]
        : undefined;

      return {
        kind: 'update_record_fields',
        payload: {
          objectNameSingular: input.objectNameSingular,
          objectLabel: objectMetadata.labelSingular,
          recordId: input.recordId,
          recordLabel: isString(labelValue) ? labelValue : input.recordId,
          changes,
        },
        preconditions: {
          fieldValuesBefore: Object.fromEntries(
            changes.map((change) => [change.fieldName, change.before]),
          ),
        },
      };
    }, actor.authContext);
  }
}
