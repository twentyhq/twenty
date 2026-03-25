import { fieldsWidgetEditorModeDraftComponentState } from '@/page-layout/states/fieldsWidgetEditorModeDraftComponentState';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { useFieldsWidgetHiddenFields } from '@/page-layout/widgets/fields/hooks/useFieldsWidgetHiddenFields';
import { type FieldsWidgetGroupField } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { getHiddenFieldsFromGroups } from '@/page-layout/widgets/fields/utils/getHiddenFieldsFromGroups';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseFieldsWidgetHiddenFieldsForDisplayParams = {
  widgetId: string;
  viewId: string | null;
  objectNameSingular: string;
};

export const useFieldsWidgetHiddenFieldsForDisplay = ({
  widgetId,
  viewId,
  objectNameSingular,
}: UseFieldsWidgetHiddenFieldsForDisplayParams) => {
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  const fieldsWidgetGroupsDraft = useAtomComponentStateValue(
    fieldsWidgetGroupsDraftComponentState,
  );

  const fieldsWidgetUngroupedFieldsDraft = useAtomComponentStateValue(
    fieldsWidgetUngroupedFieldsDraftComponentState,
  );

  const fieldsWidgetEditorModeDraft = useAtomComponentStateValue(
    fieldsWidgetEditorModeDraftComponentState,
  );

  const { hiddenFields: viewHiddenFields } = useFieldsWidgetHiddenFields({
    viewId,
    objectNameSingular,
  });

  const draftGroupsForWidget = fieldsWidgetGroupsDraft[widgetId];
  const draftEditorMode = fieldsWidgetEditorModeDraft[widgetId];
  const ungroupedFieldsForWidget = fieldsWidgetUngroupedFieldsDraft[widgetId];

  const hasDraftGroups =
    isDefined(draftGroupsForWidget) && draftGroupsForWidget.length > 0;

  const hasDraftUngroupedFields =
    isDefined(ungroupedFieldsForWidget) && ungroupedFieldsForWidget.length > 0;

  const hiddenFields = useMemo<FieldsWidgetGroupField[]>(() => {
    if (
      isPageLayoutInEditMode &&
      draftEditorMode === 'ungrouped' &&
      hasDraftUngroupedFields
    ) {
      let globalIndex = 0;

      return ungroupedFieldsForWidget
        .filter((field) => !field.isVisible)
        .sort((a, b) => a.position - b.position)
        .map((field) => ({
          ...field,
          globalIndex: globalIndex++,
        }));
    }

    if (isPageLayoutInEditMode && hasDraftGroups) {
      return getHiddenFieldsFromGroups(draftGroupsForWidget);
    }

    return viewHiddenFields;
  }, [
    isPageLayoutInEditMode,
    draftEditorMode,
    hasDraftGroups,
    hasDraftUngroupedFields,
    draftGroupsForWidget,
    ungroupedFieldsForWidget,
    viewHiddenFields,
  ]);

  return { hiddenFields };
};
