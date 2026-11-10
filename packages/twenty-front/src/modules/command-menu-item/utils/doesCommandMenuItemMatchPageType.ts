import { ContextStorePageType } from 'twenty-shared/types';
import { COMMAND_MENU_ITEM_AVAILABILITY_TYPES_REQUIRING_RECORD_CONTEXT } from '@/command-menu-item/constants/CommandMenuItemAvailabilityTypesRequiringRecordContext';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

const PAGE_TYPES_WITH_RECORD_CONTEXT = new Set([
  ContextStorePageType.Index,
  ContextStorePageType.Record,
]);

export const doesCommandMenuItemMatchPageType =
  (pageType: ContextStorePageType) => (item: CommandMenuItemFieldsFragment) =>
    !COMMAND_MENU_ITEM_AVAILABILITY_TYPES_REQUIRING_RECORD_CONTEXT.has(
      item.availabilityType,
    ) || PAGE_TYPES_WITH_RECORD_CONTEXT.has(pageType);
