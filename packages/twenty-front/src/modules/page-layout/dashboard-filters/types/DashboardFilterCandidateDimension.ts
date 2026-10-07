import {
  type DashboardFilterBinding,
  type FilterableFieldType,
} from 'twenty-shared/types';

// One pickable entry of the "Add filter" list: a field shared across widgets, or an object every widget can relate to.
export type DashboardFilterCandidateDimension = {
  key: string;
  label: string;
  icon: string | null | undefined;
  filterType: FilterableFieldType;
  proposedBindingsByWidgetId: Record<string, DashboardFilterBinding>;
  relationTargetObjectMetadataId?: string;
};
