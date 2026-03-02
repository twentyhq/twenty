import { fieldsWidgetModeDraftComponentState } from '@/page-layout/states/fieldsWidgetModeDraftComponentState';
import { type FieldsWidgetEditorMode } from '@/page-layout/widgets/fields/types/FieldsWidgetEditorMode';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useMemo } from 'react';

type UseFieldsWidgetModeParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useFieldsWidgetMode = ({
  pageLayoutId,
  widgetId,
}: UseFieldsWidgetModeParams): {
  mode: FieldsWidgetEditorMode;
} => {
  const fieldsWidgetModeDraft = useAtomComponentStateValue(
    fieldsWidgetModeDraftComponentState,
    pageLayoutId,
  );

  const mode = useMemo<FieldsWidgetEditorMode>(
    () => fieldsWidgetModeDraft[widgetId] ?? 'ungrouped',
    [fieldsWidgetModeDraft, widgetId],
  );

  return { mode };
};
