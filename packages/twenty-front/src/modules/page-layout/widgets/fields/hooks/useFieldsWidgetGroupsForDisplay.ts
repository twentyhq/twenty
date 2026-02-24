import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetModeDraftComponentState } from '@/page-layout/states/fieldsWidgetModeDraftComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { useFieldsWidgetGroups } from '@/page-layout/widgets/fields/hooks/useFieldsWidgetGroups';
import { type FieldsWidgetDisplayMode } from '@/page-layout/widgets/fields/types/FieldsWidgetDisplayMode';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { filterDraftGroupsForDisplay } from '@/page-layout/widgets/fields/utils/filterDraftGroupsForDisplay';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
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

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const allDraftGroups = useRecoilComponentValue(
    fieldsWidgetGroupsDraftComponentState,
  );

  const allUngroupedFieldsDraft = useRecoilComponentValue(
    fieldsWidgetUngroupedFieldsDraftComponentState,
  );

  const allModes = useRecoilComponentValue(fieldsWidgetModeDraftComponentState);

  const viewGroups = useFieldsWidgetGroups({
    viewId,
    objectNameSingular,
  });

  const draftGroupsForWidget = allDraftGroups[widgetId];
  const draftMode = allModes[widgetId];
  const ungroupedFieldsForWidget = allUngroupedFieldsDraft[widgetId];

  const hasDraftGroups =
    isDefined(draftGroupsForWidget) && draftGroupsForWidget.length > 0;

  const hasDraftUngroupedFields =
    isDefined(ungroupedFieldsForWidget) && ungroupedFieldsForWidget.length > 0;

  const groups = useMemo<FieldsWidgetGroup[]>(() => {
    if (
      isPageLayoutInEditMode &&
      draftMode === 'ungrouped' &&
      hasDraftUngroupedFields
    ) {
      // In edit mode with ungrouped fields, create a synthetic inline group for display
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
    draftMode,
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
      if (draftMode === 'ungrouped' && hasDraftUngroupedFields) {
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
