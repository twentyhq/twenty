import { fieldsWidgetEditorModeDraftComponentState } from '@/page-layout/states/fieldsWidgetEditorModeDraftComponentState';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { useFieldsWidgetGroups } from '@/page-layout/widgets/fields/hooks/useFieldsWidgetGroups';
import { type FieldsWidgetDisplayMode } from '@/page-layout/widgets/fields/types/FieldsWidgetDisplayMode';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { filterDraftGroupsForDisplay } from '@/page-layout/widgets/fields/utils/filterDraftGroupsForDisplay';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseFieldsWidgetGroupsForDisplayParams = {
  widgetId: string;
  viewId: string | null;
  objectNameSingular: string;
};

export const useFieldsWidgetGroupsForDisplay = ({
  widgetId,
  viewId,
  objectNameSingular,
}: UseFieldsWidgetGroupsForDisplayParams) => {
  const { t } = useLingui();

  const isPageLayoutInEditMode = useAtomComponentStateValue(
    isPageLayoutInEditModeComponentState,
  );

  const fieldsWidgetGroupsDraft = useAtomComponentStateValue(
    fieldsWidgetGroupsDraftComponentState,
  );

  const fieldsWidgetUngroupedFieldsDraft = useAtomComponentStateValue(
    fieldsWidgetUngroupedFieldsDraftComponentState,
  );

  const fieldsWidgetEditorModeDraft = useAtomComponentStateValue(
    fieldsWidgetEditorModeDraftComponentState,
  );

  const viewGroups = useFieldsWidgetGroups({
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

  const groups = useMemo<FieldsWidgetGroup[]>(() => {
    if (
      isPageLayoutInEditMode &&
      draftEditorMode === 'ungrouped' &&
      hasDraftUngroupedFields
    ) {
      const visibleFields = ungroupedFieldsForWidget
        .filter((field) => field.isVisible)
        .sort((a, b) => a.position - b.position)
        .map((field, index) => ({
          ...field,
          globalIndex: index,
        }));

      if (visibleFields.length === 0) {
        return [];
      }

      return [
        {
          id: `${widgetId}-ungrouped-display`,
          name: t`General`,
          position: 0,
          isVisible: true,
          fields: visibleFields,
        },
      ];
    }

    if (isPageLayoutInEditMode && hasDraftGroups) {
      return filterDraftGroupsForDisplay(draftGroupsForWidget);
    }

    return viewGroups.groups;
  }, [
    isPageLayoutInEditMode,
    draftEditorMode,
    hasDraftGroups,
    hasDraftUngroupedFields,
    draftGroupsForWidget,
    ungroupedFieldsForWidget,
    viewGroups.groups,
    widgetId,
    t,
  ]);

  const displayMode: FieldsWidgetDisplayMode = (() => {
    if (isPageLayoutInEditMode) {
      if (draftEditorMode === 'ungrouped' && hasDraftUngroupedFields) {
        return 'inline';
      }
      if (hasDraftGroups) {
        return 'grouped';
      }
    }
    return viewGroups.displayMode;
  })();

  return { groups, displayMode };
};
