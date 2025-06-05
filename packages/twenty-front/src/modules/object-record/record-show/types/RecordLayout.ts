import { RecordLayoutTab } from '@/ui/layout/tab-list/types/RecordLayoutTab';

export type RecordLayout = {
  hideSummaryAndFields?: boolean;
  tabs: Record<string, RecordLayoutTab | null>;
};
