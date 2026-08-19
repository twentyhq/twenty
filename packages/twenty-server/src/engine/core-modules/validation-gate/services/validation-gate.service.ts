import { Injectable, Logger } from '@nestjs/common';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  VALIDATION_RULES,
  type ValidationRequirement,
  type ValidationRule,
} from 'src/engine/core-modules/validation-gate/validation-gate.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

@Injectable()
export class ValidationGateService {
  private readonly logger = new Logger(ValidationGateService.name);
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}
  /**
   * Throws if the incoming update violates a rule. Returns silently otherwise.
   *
   * Runs inside a PRE_HOOK, i.e. BEFORE the write reaches the database.
   */
  async assertUpdateAllowed({
    authContext,
    objectName,
    recordId,
    data,
  }: {
    authContext: WorkspaceAuthContext;
    objectName: string;
    recordId: string;
    data: Record<string, unknown>;
  }): Promise<void> {
    // --- Scope -------------------------------------------------------------
    // System-originated writes (workflows, cron, internal jobs) are exempt.
    // Without this, a workflow that sets `stage` would be blocked by its own gate.
    if (isSystemAuthContext(authContext)) {
      return;
    }
    const rules = this.findMatchingRules(objectName, data);
    if (rules.length === 0) {
      return;
    }
    const workspaceId = authContext.workspace.id;
    const failures = await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        // The payload contains ONLY changed fields. Requirements must be evaluated
        // against the stored record merged with the incoming payload, otherwise a
        // user who uploads the file AND changes stage in one save is wrongly blocked.
        const repository = await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          objectName,
          { shouldBypassPermissionChecks: true },
        );
        const storedRecord = await repository.findOneBy({ id: recordId });
        const effectiveRecord: Record<string, unknown> = {
          ...(storedRecord ?? {}),
          ...data,
        };
        const collected: string[] = [];
        for (const rule of rules) {
          for (const requirement of rule.requirements) {
            const ok = await this.checkRequirement({
              requirement,
              effectiveRecord,
              workspaceId,
              recordId,
            });
            if (!ok) {
              collected.push(requirement.message);
            }
          }
        }
        return collected;
      },
      authContext,
    );
    if (failures.length > 0) {
      this.logger.log(
        `Blocked ${objectName} ${recordId}: ${failures.length} unmet requirement(s)`,
      );
      // Report every failure at once - surfacing them one at a time turns a
      // single blocked save into several round trips for the user.
      throw new GraphqlQueryRunnerException(
        `Validation gate: ${failures.length} requirement(s) not met`,
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: failures.join('\n') },
      );
    }
  }
  private findMatchingRules(
    objectName: string,
    data: Record<string, unknown>,
  ): ValidationRule[] {
    return VALIDATION_RULES.filter((rule) => {
      if (rule.objectNameSingular !== objectName) {
        return false;
      }
      // Only fire when the watched field is actually part of this write AND is
      // moving to the gated value. Edits that do not touch `stage` pass straight through.
      return data[rule.whenField] === rule.whenChangesTo;
    });
  }
  private async checkRequirement({
    requirement,
    effectiveRecord,
    workspaceId,
    recordId,
  }: {
    requirement: ValidationRequirement;
    effectiveRecord: Record<string, unknown>;
    workspaceId: string;
    recordId: string;
  }): Promise<boolean> {
    switch (requirement.type) {
      case 'filesFieldNotEmpty': {
        const value = effectiveRecord[requirement.field];
        // A FILES field is stored as [{ fileId, label }] and an empty array is
        // normalised to null on write, so null/undefined/[] all mean "no file".
        return Array.isArray(value) && value.length > 0;
      }
      case 'relationNotEmpty': {
        const childRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            requirement.targetObjectNameSingular,
            { shouldBypassPermissionChecks: true },
          );
        // Soft-deleted rows are excluded by default (withDeleted is opt-in).
        const count = await childRepository.count({
          where: { [requirement.foreignKeyColumn]: recordId },
        });
        return count >= requirement.min;
      }
      default: {
        // Unknown requirement type: fail open rather than block a save on a
        // config error. Logged so it is visible.
        this.logger.warn(
          `Unknown requirement type: ${JSON.stringify(requirement)}`,
        );
        return true;
      }
    }
  }
}
