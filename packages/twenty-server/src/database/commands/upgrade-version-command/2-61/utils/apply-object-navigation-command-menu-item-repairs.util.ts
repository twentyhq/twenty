import { type Repository } from 'typeorm';

import { invalidateCommandMenuItemReownCache } from 'src/database/commands/upgrade-version-command/2-38/utils/invalidate-command-menu-item-reown-cache.util';
import { type ObjectNavigationCommandMenuItemRepair } from 'src/database/commands/upgrade-version-command/2-61/types/object-navigation-command-menu-item-repair.type';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { type WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

export const applyObjectNavigationCommandMenuItemRepairs = async ({
  workspaceId,
  repairs,
  commandMenuItemRepository,
  workspaceMigrationRunnerService,
}: {
  workspaceId: string;
  repairs: ObjectNavigationCommandMenuItemRepair[];
  commandMenuItemRepository: Repository<CommandMenuItemEntity>;
  workspaceMigrationRunnerService: WorkspaceMigrationRunnerService;
}): Promise<void> => {
  await commandMenuItemRepository.manager.transaction(async (entityManager) => {
    const transactionalCommandMenuItemRepository = entityManager.getRepository(
      CommandMenuItemEntity,
    );

    for (const { id, update } of repairs) {
      await transactionalCommandMenuItemRepository.update(
        { id, workspaceId },
        update,
      );
    }
  });

  await invalidateCommandMenuItemReownCache({
    workspaceId,
    workspaceMigrationRunnerService,
  });
};
