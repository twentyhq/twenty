import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type DashboardFilterSlot } from 'twenty-shared/types';

export const updateDashboardFilterSlotInDraft = ({
  draft,
  slotId,
  slotUpdate,
}: {
  draft: DraftPageLayout;
  slotId: string;
  slotUpdate: Partial<Omit<DashboardFilterSlot, 'id'>>;
}): DraftPageLayout => ({
  ...draft,
  dashboardFilters: (draft.dashboardFilters ?? []).map((slot) =>
    slot.id === slotId ? { ...slot, ...slotUpdate } : slot,
  ),
});
