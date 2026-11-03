import { isDefined } from 'twenty-shared/utils';

import { COMMAND_MENU_ITEM_AVAILABILITY_TYPES_REQUIRING_RECORD_CONTEXT } from '@/command-menu-item/constants/CommandMenuItemAvailabilityTypesRequiringRecordContext';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

export const doesCommandMenuItemMatchObjectContext =
  (objectMetadataItemId: unknown) =>
  (item: Pick<CommandMenuItemFieldsFragment, 'availabilityType'>) =>
    !COMMAND_MENU_ITEM_AVAILABILITY_TYPES_REQUIRING_RECORD_CONTEXT.has(
      item.availabilityType,
    ) || isDefined(objectMetadataItemId);
