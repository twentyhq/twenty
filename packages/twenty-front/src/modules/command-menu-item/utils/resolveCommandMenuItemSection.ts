import { isDefined } from 'twenty-shared/utils';

import { COMMAND_MENU_ITEM_SECTION_BY_AVAILABILITY_TYPE } from '@/command-menu-item/constants/CommandMenuItemSectionByAvailabilityType';
import { COMMAND_MENU_ITEM_SECTION_BY_ENGINE_COMPONENT_KEY } from '@/command-menu-item/constants/CommandMenuItemSectionByEngineComponentKey';
import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { type CommandMenuItemSection } from '@/command-menu-item/types/CommandMenuItemSection';
import { type EngineComponentKey } from '~/generated-metadata/graphql';

const sectionByEngineComponentKey: Partial<
  Record<EngineComponentKey, CommandMenuItemSection>
> = COMMAND_MENU_ITEM_SECTION_BY_ENGINE_COMPONENT_KEY;

export const resolveCommandMenuItemSection = (
  commandMenuItem: Pick<
    CommandMenuItemDefinition,
    'engineComponentKey' | 'availabilityType' | 'creationTargetObjectMetadataId'
  >,
): CommandMenuItemSection => {
  // Per-object creation commands are synthesized from the CREATE_NEW_RECORD
  // template, so the engine key alone cannot tell them from the view's own
  // create command.
  if (isDefined(commandMenuItem.creationTargetObjectMetadataId)) {
    return 'CREATE_RECORD';
  }

  return (
    sectionByEngineComponentKey[commandMenuItem.engineComponentKey] ??
    COMMAND_MENU_ITEM_SECTION_BY_AVAILABILITY_TYPE[
      commandMenuItem.availabilityType
    ]
  );
};
