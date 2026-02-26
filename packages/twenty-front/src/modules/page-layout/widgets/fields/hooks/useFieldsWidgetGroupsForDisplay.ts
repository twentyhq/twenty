import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { useFieldsWidgetGroups } from '@/page-layout/widgets/fields/hooks/useFieldsWidgetGroups';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { filterDraftGroupsForDisplay } from '@/page-layout/widgets/fields/utils/filterDraftGroupsForDisplay';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
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
  const isPageLayoutInEditMode = useAtomComponentStateValue(
    isPageLayoutInEditModeComponentState,
  );

  const fieldsWidgetGroupsDraft = useAtomComponentStateValue(
    fieldsWidgetGroupsDraftComponentState,
  );

  const viewGroups = useFieldsWidgetGroups({
    viewId,
    objectNameSingular,
  });

  const draftGroupsForWidget = fieldsWidgetGroupsDraft[widgetId];
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
