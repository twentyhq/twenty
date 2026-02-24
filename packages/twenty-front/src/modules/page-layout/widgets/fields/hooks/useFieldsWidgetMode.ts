import { fieldsWidgetModeDraftComponentState } from '@/page-layout/states/fieldsWidgetModeDraftComponentState';
import { type FieldsWidgetEditorMode } from '@/page-layout/widgets/fields/types/FieldsWidgetEditorMode';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
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
  const allModes = useRecoilComponentValue(
    fieldsWidgetModeDraftComponentState,
    pageLayoutId,
  );

  const mode = useMemo<FieldsWidgetEditorMode>(
    () => allModes[widgetId] ?? 'ungrouped',
    [allModes, widgetId],
  );

  return { mode };
};
