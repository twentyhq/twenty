import { useHasFieldsWidgetChanges } from '@/page-layout/hooks/useHasFieldsWidgetChanges';
import { useHasRecordTableWidgetViewChanges } from '@/page-layout/hooks/useHasRecordTableWidgetViewChanges';
import { useSaveFieldsWidgetGroups } from '@/page-layout/hooks/useSaveFieldsWidgetGroups';
import { useSaveRecordTableWidgetViews } from '@/page-layout/hooks/useSaveRecordTableWidgetViews';
import { useCallback } from 'react';

export const useSavePageLayoutWidgetsData = () => {
  const { hasFieldsWidgetChanges } = useHasFieldsWidgetChanges();

  const { hasRecordTableWidgetViewChanges } =
    useHasRecordTableWidgetViewChanges();

  const { saveFieldsWidgetGroups } = useSaveFieldsWidgetGroups();

  const { saveRecordTableWidgetViews } = useSaveRecordTableWidgetViews();

  const savePageLayoutWidgetsData = useCallback(
    async (pageLayoutId: string) => {
      if (hasFieldsWidgetChanges(pageLayoutId)) {
        await saveFieldsWidgetGroups(pageLayoutId);
      }

      if (hasRecordTableWidgetViewChanges(pageLayoutId)) {
        await saveRecordTableWidgetViews(pageLayoutId);
      }
    },
    [
      hasFieldsWidgetChanges,
      hasRecordTableWidgetViewChanges,
      saveFieldsWidgetGroups,
      saveRecordTableWidgetViews,
    ],
  );

  return { savePageLayoutWidgetsData };
};
