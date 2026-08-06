import { type EntityManager } from 'typeorm';

import { type RecordPageReownUpdates } from 'src/database/commands/upgrade-version-command/2-29/types/record-page-reown-updates.type';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { ViewFieldGroupEntity } from 'src/engine/metadata-modules/view-field-group/entities/view-field-group.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

export const applyRecordPageReownUpdates = async ({
  manager,
  workspaceId,
  reownUpdates,
}: {
  manager: EntityManager;
  workspaceId: string;
  reownUpdates: RecordPageReownUpdates;
}): Promise<void> => {
  await manager.transaction(async (entityManager) => {
    const updatesByEntity = [
      [PageLayoutEntity, reownUpdates.pageLayoutUpdates],
      [PageLayoutTabEntity, reownUpdates.pageLayoutTabUpdates],
      [PageLayoutWidgetEntity, reownUpdates.pageLayoutWidgetUpdates],
      [ViewEntity, reownUpdates.viewUpdates],
      [ViewFieldEntity, reownUpdates.viewFieldUpdates],
      [ViewFieldGroupEntity, reownUpdates.viewFieldGroupUpdates],
    ] as const;

    for (const [entity, updates] of updatesByEntity) {
      const repository = entityManager.getRepository(entity);

      for (const { id, update } of updates) {
        await repository.update({ id, workspaceId }, update);
      }
    }
  });
};
