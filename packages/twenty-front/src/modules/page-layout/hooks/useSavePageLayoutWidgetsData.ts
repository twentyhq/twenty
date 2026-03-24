import { useHasFieldsWidgetChanges } from '@/page-layout/hooks/useHasFieldsWidgetChanges';
import { useHasRecordTableWidgets } from '@/page-layout/hooks/useHasRecordTableWidgets';
import { useSaveFieldsWidgetGroups } from '@/page-layout/hooks/useSaveFieldsWidgetGroups';
import { useSaveRecordTableWidgetsViewDataOnDashboardSave } from '@/page-layout/widgets/record-table/hooks/useSaveRecordTableWidgetsViewDataOnDashboardSave';
import { useCallback } from 'react';

export const useSavePageLayoutWidgetsData = () => {
  const { hasFieldsWidgetChanges } = useHasFieldsWidgetChanges();

  const { hasRecordTableWidgets } = useHasRecordTableWidgets();

  const { saveFieldsWidgetGroups } = useSaveFieldsWidgetGroups();

  const { saveRecordTableWidgetsViewDataOnDashboardSave } =
    useSaveRecordTableWidgetsViewDataOnDashboardSave();

  const savePageLayoutWidgetsData = useCallback(
    async (pageLayoutId: string) => {
      if (hasFieldsWidgetChanges(pageLayoutId)) {
        await saveFieldsWidgetGroups(pageLayoutId);
      }

      if (hasRecordTableWidgets(pageLayoutId)) {
        await saveRecordTableWidgetsViewDataOnDashboardSave(pageLayoutId);
      }
    },
    [
      hasFieldsWidgetChanges,
      saveFieldsWidgetGroups,
      saveRecordTableWidgetsViewDataOnDashboardSave,
      hasRecordTableWidgets,
    ],
  );

  return { savePageLayoutWidgetsData };
};
