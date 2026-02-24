import { useCommandMenuHistory } from '@/command-menu/hooks/useCommandMenuHistory';
import { SidePanelSubPageNavigationHeader } from '@/command-menu/pages/common/components/SidePanelSubPageNavigationHeader';
import { ChartFiltersSettingsInitializeStateEffect } from '@/command-menu/pages/page-layout/components/ChartFiltersSettingsInitializeStateEffect';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { type ChartWidget } from '@/command-menu/pages/page-layout/types/ChartWidget';
import { type ChartWidgetConfiguration } from '@/command-menu/pages/page-layout/types/ChartWidgetConfiguration';
import { getChartFiltersSettingsInstanceId } from '@/command-menu/pages/page-layout/utils/getChartFiltersSettingsInstanceId';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { AdvancedFilterCommandMenuContainer } from '@/object-record/advanced-filter/command-menu/components/AdvancedFilterCommandMenuContainer';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

const StyledChartFiltersPageContainer = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.spacing(2)};

  padding: ${({ theme }) => theme.spacing(3)};
`;

export type ChartFiltersSettingsProps = {
  objectMetadataItem: ObjectMetadataItem;
  widget: ChartWidget;
};

export const ChartFiltersSettings = ({
  objectMetadataItem,
  widget,
}: ChartFiltersSettingsProps) => {
  const { goBackFromCommandMenu } = useCommandMenuHistory();

  const { instanceId } = getChartFiltersSettingsInstanceId({
    widgetId: widget.id,
    objectMetadataItemId: objectMetadataItem.id,
  });

  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const currentRecordFiltersAtom = useRecoilComponentStateCallbackStateV2(
    currentRecordFiltersComponentState,
    instanceId,
  );

  const currentRecordFilterGroupsAtom = useRecoilComponentStateCallbackStateV2(
    currentRecordFilterGroupsComponentState,
    instanceId,
  );

  const store = useStore();
  const chartWidgetConfiguration = widget.configuration;

  const handleFiltersUpdate = () => {
    const currentRecordFilters = store.get(currentRecordFiltersAtom);
    const currentRecordFilterGroups = store.get(currentRecordFilterGroupsAtom);

    updateCurrentWidgetConfig({
      objectMetadataId: objectMetadataItem.id,
      configToUpdate: {
        filter: {
          recordFilters: currentRecordFilters,
          recordFilterGroups: currentRecordFilterGroups,
        },
      } satisfies Partial<ChartWidgetConfiguration>,
    });
  };

  return (
    <>
      <SidePanelSubPageNavigationHeader
        title={t`Filter`}
        onBackClick={goBackFromCommandMenu}
      />
      <StyledChartFiltersPageContainer>
        <div>
          <InputLabel>{t`Conditions`}</InputLabel>
          <RecordFilterGroupsComponentInstanceContext.Provider
            value={{ instanceId }}
          >
            <RecordFiltersComponentInstanceContext.Provider
              value={{ instanceId }}
            >
              <AdvancedFilterCommandMenuContainer
                onUpdate={handleFiltersUpdate}
                objectMetadataItem={objectMetadataItem}
                isWorkflowFindRecords={false}
              />
              <ChartFiltersSettingsInitializeStateEffect
                initialChartFilters={chartWidgetConfiguration.filter}
              />
            </RecordFiltersComponentInstanceContext.Provider>
          </RecordFilterGroupsComponentInstanceContext.Provider>
        </div>
      </StyledChartFiltersPageContainer>
    </>
  );
};
