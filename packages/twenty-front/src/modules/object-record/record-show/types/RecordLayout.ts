import { type RecordLayoutTab } from '@/ui/layout/tab-list/types/RecordLayoutTab';

export type RecordLayout = {
  hideSummaryAndFields?: boolean;
  hideFieldsInSidePanel?: boolean;
  tabs: Record<string, RecordLayoutTab | null>;
};
