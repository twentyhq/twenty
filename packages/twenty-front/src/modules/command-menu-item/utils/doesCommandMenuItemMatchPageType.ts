import { ContextStorePageType } from 'twenty-shared/types';
import {
  CommandMenuItemAvailabilityType,
  type CommandMenuItemFieldsFragment,
} from '~/generated-metadata/graphql';

const PAGE_TYPES_WITH_GLOBAL_OBJECT_CONTEXT = new Set([
  ContextStorePageType.Index,
  ContextStorePageType.Record,
]);

export const doesCommandMenuItemMatchPageType =
  (pageType: ContextStorePageType) => (item: CommandMenuItemFieldsFragment) =>
    item.availabilityType !==
      CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT ||
    PAGE_TYPES_WITH_GLOBAL_OBJECT_CONTEXT.has(pageType);
