import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useChartBucketDashboardCrossFilter } from '@/page-layout/dashboard-filters/hooks/useChartBucketDashboardCrossFilter';
import { graphWidgetChartBucketMenuComponentState } from '@/page-layout/widgets/graph/states/graphWidgetChartBucketMenuComponentState';
import { graphWidgetChartClickPositionComponentState } from '@/page-layout/widgets/graph/states/graphWidgetChartClickPositionComponentState';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { getGraphWidgetChartBucketMenuDropdownId } from '@/page-layout/widgets/graph/utils/getGraphWidgetChartBucketMenuDropdownId';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useStore } from 'jotai';
import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
  type PieChartConfiguration,
} from '~/generated-metadata/graphql';

type UseGraphWidgetChartBucketMenuArgs = {
  widgetId: string;
  configuration:
    | BarChartConfiguration
    | LineChartConfiguration
    | PieChartConfiguration;
  objectMetadataItem: { fields: FieldMetadataItem[] };
};

export const useGraphWidgetChartBucketMenu = ({
  widgetId,
  configuration,
  objectMetadataItem,
}: UseGraphWidgetChartBucketMenuArgs) => {
  const { canCrossFilterChartBuckets, getChartBucketCrossFilterTarget } =
    useChartBucketDashboardCrossFilter({
      widgetId,
      configuration,
      objectMetadataItem,
    });

  const dropdownId = useWorkspaceSurfaceScopedComponentInstanceId(
    getGraphWidgetChartBucketMenuDropdownId(widgetId),
  );

  const setGraphWidgetChartBucketMenu = useSetAtomComponentState(
    graphWidgetChartBucketMenuComponentState,
  );

  const store = useStore();

  const graphWidgetChartClickPositionState = useAtomComponentStateCallbackState(
    graphWidgetChartClickPositionComponentState,
  );

  const { openDropdown } = useOpenDropdown();

  // The charts report a clicked bucket without its mouse event, and the click may come from the floating
  // tooltip, so the position is taken from the capture phase on the chart area; it is read back in the same
  // event dispatch, which is why it goes through the store rather than a subscribed value.
  const handleChartClickCapture = (event: MouseEvent<HTMLElement>) => {
    store.set(graphWidgetChartClickPositionState, {
      x: event.clientX,
      y: event.clientY,
    });
  };

  const tryOpenChartBucketMenu = (bucketRawValue: RawDimensionValue) => {
    const crossFilterTarget = getChartBucketCrossFilterTarget(bucketRawValue);

    if (!isDefined(crossFilterTarget)) {
      return false;
    }

    setGraphWidgetChartBucketMenu({
      bucketRawValue,
      slotId: crossFilterTarget.slot.id,
      value: crossFilterTarget.value,
      anchorPosition: store.get(graphWidgetChartClickPositionState),
    });
    openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });

    return true;
  };

  return {
    canCrossFilterChartBuckets,
    handleChartClickCapture,
    tryOpenChartBucketMenu,
  };
};
