import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';

export type CoreAgentsSelection = {
  filterSettings: FilterSettings;
  rowIds: string[];
};
