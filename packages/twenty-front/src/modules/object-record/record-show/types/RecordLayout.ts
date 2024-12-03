import { RecordLayoutTab } from '@/ui/layout/tab/types/RecordLayoutTab';

export type RecordLayout = {
  hideSummaryAndFields?: boolean;
  tabs: Record<string, RecordLayoutTab | null>;
};
