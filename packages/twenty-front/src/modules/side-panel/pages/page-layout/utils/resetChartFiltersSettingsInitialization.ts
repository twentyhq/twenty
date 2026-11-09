import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { hasInitializedChartFiltersComponentState } from '@/side-panel/pages/page-layout/states/hasInitializedChartFiltersComponentState';
import { getChartFiltersSettingsInstanceId } from '@/side-panel/pages/page-layout/utils/getChartFiltersSettingsInstanceId';
import { type createStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

// The chart Filters page loads its conditions once; this makes it reload them from the draft
export const resetChartFiltersSettingsInitialization = ({
  store,
  widgets,
}: {
  store: ReturnType<typeof createStore>;
  widgets: Pick<PageLayoutWidget, 'id' | 'objectMetadataId'>[];
}) => {
  for (const { id, objectMetadataId } of widgets) {
    if (!isDefined(objectMetadataId)) {
      continue;
    }

    const { instanceId } = getChartFiltersSettingsInstanceId({
      widgetId: id,
      objectMetadataItemId: objectMetadataId,
    });

    store.set(
      hasInitializedChartFiltersComponentState.atomFamily({ instanceId }),
      false,
    );
  }
};
