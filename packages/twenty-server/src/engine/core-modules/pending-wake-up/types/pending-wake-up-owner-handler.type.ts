import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { type PendingWakeUpOutcome } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-outcome.type';
import { type PendingWakeUpOwnerState } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-state.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';

export type PendingWakeUpOwnerHandler<TOwner = unknown> = {
  buildResumeJobOptions(ownerId: string): QueueJobOptions;

  getOwnerState(
    wakeUp: PendingWakeUpEntity,
  ): Promise<PendingWakeUpOwnerState<TOwner>>;

  getReadPermissions(input: {
    wakeUp: PendingWakeUpEntity;
    owner: TOwner;
  }): Promise<{
    authContext: WorkspaceAuthContext;
    rolePermissionConfig: RolePermissionConfig;
  }>;

  resolve(input: {
    claimedWakeUp: PendingWakeUpEntity;
    outcome: PendingWakeUpOutcome;
    owner: TOwner | null;
    isOwnerGone: boolean;
  }): Promise<void>;
};
