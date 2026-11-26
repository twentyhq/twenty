import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordTableWidgetLayoutViewType } from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { buildDraftViewGroupsForFieldMetadataItem } from '@/page-layout/widgets/record-table/utils/buildDraftViewGroupsForFieldMetadataItem';
import { isDefined, isViewCompactByDefault } from 'twenty-shared/utils';
import { ViewCalendarLayout, ViewType } from '~/generated-metadata/graphql';

export const applyLayoutToRecordTableWidgetViewSnapshot = ({
  widgetViewSnapshot,
  targetViewType,
  defaultGroupByFieldMetadataItem,
  defaultCalendarFieldMetadataItem,
}: {
  widgetViewSnapshot: RecordTableWidgetViewSnapshot;
  targetViewType: RecordTableWidgetLayoutViewType;
  defaultGroupByFieldMetadataItem: FieldMetadataItem | null;
  defaultCalendarFieldMetadataItem?: FieldMetadataItem | null;
}): RecordTableWidgetViewSnapshot => {
  const isCompactByDefault = isViewCompactByDefault(targetViewType);
  const isCompact =
    isCompactByDefault === isViewCompactByDefault(widgetViewSnapshot.view.type)
      ? widgetViewSnapshot.view.isCompact
      : isCompactByDefault;

  if (targetViewType === ViewType.KANBAN_WIDGET) {
    const hasGroupBy = isDefined(
      widgetViewSnapshot.view.mainGroupByFieldMetadataId,
    );

    if (!hasGroupBy && !isDefined(defaultGroupByFieldMetadataItem)) {
      return widgetViewSnapshot;
    }

    return {
      ...widgetViewSnapshot,
      view: {
        ...widgetViewSnapshot.view,
        type: targetViewType,
        isCompact,
        mainGroupByFieldMetadataId: hasGroupBy
          ? widgetViewSnapshot.view.mainGroupByFieldMetadataId
          : defaultGroupByFieldMetadataItem?.id,
      },
      viewGroups:
        hasGroupBy || !isDefined(defaultGroupByFieldMetadataItem)
          ? widgetViewSnapshot.viewGroups
          : buildDraftViewGroupsForFieldMetadataItem({
              viewId: widgetViewSnapshot.view.id,
              fieldMetadataItem: defaultGroupByFieldMetadataItem,
            }),
    };
  }

  if (targetViewType === ViewType.CALENDAR_WIDGET) {
    const hasCalendarField = isDefined(
      widgetViewSnapshot.view.calendarFieldMetadataId,
    );

    if (!hasCalendarField && !isDefined(defaultCalendarFieldMetadataItem)) {
      return widgetViewSnapshot;
    }

    return {
      ...widgetViewSnapshot,
      view: {
        ...widgetViewSnapshot.view,
        type: targetViewType,
        isCompact,
        calendarLayout:
          widgetViewSnapshot.view.calendarLayout ?? ViewCalendarLayout.MONTH,
        calendarFieldMetadataId: hasCalendarField
          ? widgetViewSnapshot.view.calendarFieldMetadataId
          : defaultCalendarFieldMetadataItem?.id,
      },
    };
  }

  return {
    ...widgetViewSnapshot,
    view: {
      ...widgetViewSnapshot.view,
      type: targetViewType,
      isCompact,
    },
  };
};
