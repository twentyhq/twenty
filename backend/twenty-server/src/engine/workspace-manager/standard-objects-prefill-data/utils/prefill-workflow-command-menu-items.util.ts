import { type EntityManager } from 'typeorm';

import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/enums/command-menu-item-availability-type.enum';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { QUICK_LEAD_WORKFLOW_VERSION_ID } from 'src/engine/workspace-manager/standard-objects-prefill-data/utils/prefill-workflows.util';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const QUICK_LEAD_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  'a1b2c3d4-e5f6-7890-abcd-1234567890ab';

export const prefillWorkflowCommandMenuItems = async (
  entityManager: EntityManager,
  workspaceId: string,
) => {
  const applicationRow = await entityManager
    .createQueryBuilder()
    .select('app.id')
    .from('core.application', 'app')
    .where('app.universalIdentifier = :universalIdentifier', {
      universalIdentifier: TWENTY_STANDARD_APPLICATION.universalIdentifier,
    })
    .andWhere('app.workspaceId = :workspaceId', { workspaceId })
    .getRawOne();

  if (!applicationRow) {
    return;
  }

  await entityManager
    .createQueryBuilder()
    .insert()
    .into('core.commandMenuItem', [
      'workspaceId',
      'universalIdentifier',
      'applicationId',
      'workflowVersionId',
      'frontComponentId',
      'engineComponentKey',
      'label',
      'icon',
      'shortLabel',
      'position',
      'isPinned',
      'availabilityType',
      'conditionalAvailabilityExpression',
      'availabilityObjectMetadataId',
      'hotKeys',
    ])
    .values([
      {
        workspaceId,
        universalIdentifier: QUICK_LEAD_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
        applicationId: applicationRow.app_id,
        workflowVersionId: QUICK_LEAD_WORKFLOW_VERSION_ID,
        frontComponentId: null,
        engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
        label: 'Quick Lead',
        icon: 'IconUserPlus',
        shortLabel: 'Quick Lead',
        position: 100,
        isPinned: false,
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
        conditionalAvailabilityExpression: null,
        availabilityObjectMetadataId: null,
        hotKeys: null,
      },
    ])
    .orIgnore()
    .execute();
};
