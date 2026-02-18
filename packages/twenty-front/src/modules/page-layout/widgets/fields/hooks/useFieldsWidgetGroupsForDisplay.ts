import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { useFieldsWidgetGroups } from '@/page-layout/widgets/fields/hooks/useFieldsWidgetGroups';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseFieldsWidgetGroupsForDisplayParams = {
  widgetId: string;
  viewId: string | null;
  objectNameSingular: string;
};

// Filters draft groups to only include visible groups/fields,
// matching the filtering logic in useFieldsWidgetGroups for View data.
const filterDraftGroupsForDisplay = (
  draftGroups: FieldsWidgetGroup[],
): FieldsWidgetGroup[] => {
  const sortedGroups = [...draftGroups].sort((a, b) => a.position - b.position);

  let globalIndex = 0;

  return sortedGroups
    .filter((group) => group.isVisible)
    .map((group) => {
      const visibleFields = [...group.fields]
        .sort((a, b) => a.position - b.position)
        .filter((field) => field.isVisible)
        .map((field) => ({
          ...field,
          globalIndex: globalIndex++,
        }));

      return {
        ...group,
        fields: visibleFields,
      };
    })
    .filter((group) => group.fields.length > 0);
};

export const useFieldsWidgetGroupsForDisplay = ({
  widgetId,
  viewId,
  objectNameSingular,
}: UseFieldsWidgetGroupsForDisplayParams) => {
  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const allDraftGroups = useRecoilComponentValue(
    fieldsWidgetGroupsDraftComponentState,
  );

  const viewGroups = useFieldsWidgetGroups({
    viewId,
    objectNameSingular,
  });

  const draftGroupsForWidget = allDraftGroups[widgetId];
  const hasDraftGroups =
    isDefined(draftGroupsForWidget) && draftGroupsForWidget.length > 0;

  const groups = useMemo<FieldsWidgetGroup[]>(() => {
    if (isPageLayoutInEditMode && hasDraftGroups) {
      return filterDraftGroupsForDisplay(draftGroupsForWidget);
    }

    return viewGroups.groups;
  }, [
    isPageLayoutInEditMode,
    hasDraftGroups,
    draftGroupsForWidget,
    viewGroups.groups,
  ]);

  return { groups };
};
