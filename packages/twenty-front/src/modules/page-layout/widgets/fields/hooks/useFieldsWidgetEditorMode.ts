import { fieldsWidgetEditorModeDraftComponentState } from '@/page-layout/states/fieldsWidgetEditorModeDraftComponentState';
import { type FieldsWidgetEditorMode } from '@/page-layout/widgets/fields/types/FieldsWidgetEditorMode';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type UseFieldsWidgetEditorModeParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useFieldsWidgetEditorMode = ({
  pageLayoutId,
  widgetId,
}: UseFieldsWidgetEditorModeParams): {
  editorMode: FieldsWidgetEditorMode;
} => {
  const fieldsWidgetEditorModeDraft = useAtomComponentStateValue(
    fieldsWidgetEditorModeDraftComponentState,
    pageLayoutId,
  );

  const editorMode = fieldsWidgetEditorModeDraft[widgetId];

  return { editorMode };
};
