import { ContextStorePageType } from 'twenty-shared/types';
import {
  CommandMenuItemAvailabilityType,
  type CommandMenuItemFieldsFragment,
} from '~/generated-metadata/graphql';

const PAGE_TYPES_WITH_RECORD_CONTEXT = new Set([
  ContextStorePageType.Index,
  ContextStorePageType.Record,
]);

const AVAILABILITY_TYPES_REQUIRING_RECORD_CONTEXT = new Set([
  CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT,
  CommandMenuItemAvailabilityType.RECORD_SELECTION,
]);

export const doesCommandMenuItemMatchPageType =
  (pageType: ContextStorePageType) => (item: CommandMenuItemFieldsFragment) =>
    !AVAILABILITY_TYPES_REQUIRING_RECORD_CONTEXT.has(item.availabilityType) ||
    PAGE_TYPES_WITH_RECORD_CONTEXT.has(pageType);
