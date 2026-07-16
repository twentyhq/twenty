import { Injectable, Logger } from '@nestjs/common';

/**
 * Scoping guard for the transactional outbox.
 * Before appending, checks whether the target object is tracked by
 * externalEntityLink records for the workspace.
 *
 * At PR2 time, the externalEntityLink table may not exist yet (PR4 object).
 * The guard safely handles this — if no tracking table or no records,
 * it defaults to no-op.
 */
@Injectable()
export class OutboxScopingGuard {
  private readonly logger = new Logger(OutboxScopingGuard.name);

  /**
   * Check whether the given object type is sync-enabled for the workspace.
   * Safe to call when externalEntityLink table doesn't exist (PR2-before-PR4).
   */
  async isSyncEnabled(
    workspaceId: string,
    objectNameSingular: string,
  ): Promise<boolean> {
    try {
      // PR2: externalEntityLink table doesn't exist yet → return false (no-op)
      // PR4: this will check if any externalEntityLink records exist for
      //       this object type in the workspace
      return await this.checkExternalEntityLink(
        workspaceId,
        objectNameSingular,
      );
    } catch {
      // Table doesn't exist or connection issue → safe no-op
      this.logger.debug(
        `Scoping guard: defaulting to no-op for ${objectNameSingular} (table may not exist)`,
      );
      return false;
    }
  }

  private async checkExternalEntityLink(
    _workspaceId: string,
    _objectNameSingular: string,
  ): Promise<boolean> {
    // PR2 stub: always returns false (no externalEntityLink table)
    // PR4+ implementation: looks up externalEntityLink records
    return false;
  }
}
