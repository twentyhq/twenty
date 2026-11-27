import { type SidePanelEditColumnSummaryShowOption } from '@/side-panel/pages/edit-column/types/SidePanelEditColumnSummaryShowOption';

export type SidePanelEditColumnShowSelectEntry = {
  id: string;
  label: string;
  icon: string | null | undefined;
  value: string | null;
  summaryShowOptions: SidePanelEditColumnSummaryShowOption[];
};
