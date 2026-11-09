import { type DashboardFilterWidgetCandidateFieldMetadataIds } from '@/page-layout/types/DashboardFilterWidgetCandidateFieldMetadataIds';
import { type DashboardFilterWidgetField } from '@/page-layout/types/DashboardFilterWidgetField';
import { type DashboardFilterBinding } from 'twenty-shared/types';

export type DashboardFilterWidget = {
  widgetId: string;
  widgetTitle: string;
  tabTitle: string | null;
  isReadOnly: boolean;
  bindings: DashboardFilterBinding[];
  candidateFieldMetadataIds: DashboardFilterWidgetCandidateFieldMetadataIds;
  fields: DashboardFilterWidgetField[];
};
