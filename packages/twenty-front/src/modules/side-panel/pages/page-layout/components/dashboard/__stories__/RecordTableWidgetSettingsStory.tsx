import { SidePanelDashboardRecordTableSettings } from '@/side-panel/pages/page-layout/components/dashboard/SidePanelDashboardRecordTableSettings';
import { WidgetViewLayoutSettingsRows } from '@/side-panel/pages/page-layout/components/record-table-settings/WidgetViewLayoutSettingsRows';
import { RECORD_TABLE_WIDGET_SETTINGS_STORY_DATA } from '@/side-panel/pages/page-layout/components/dashboard/__stories__/recordTableWidgetSettingsStoryData';
import { PageLayoutSidePanelTargetContext } from '@/side-panel/pages/page-layout/contexts/PageLayoutSidePanelTargetContext';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { SIDE_PANEL_CLICK_OUTSIDE_ID } from '@/side-panel/constants/SidePanelClickOutsideId';
import { SIDE_PANEL_CONSTRAINTS } from '@/side-panel/constants/SidePanelConstraints';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { SIDE_PANEL_SELECTABLE_LIST_ID } from '@/side-panel/constants/SidePanelSelectableListId';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const StyledPanel = styled.div`
  align-self: stretch;
  margin-left: auto;
  margin-top: ${themeCssVariables.spacing[6]};
  width: ${SIDE_PANEL_CONSTRAINTS.min}px;
`;

type RecordTableWidgetSettingsStoryProps = {
  shouldShowLayoutRowsOnly?: boolean;
  onBackgroundClickOutside: () => void;
};

export const RecordTableWidgetSettingsStory = ({
  shouldShowLayoutRowsOnly = false,
  onBackgroundClickOutside,
}: RecordTableWidgetSettingsStoryProps) => {
  const { pageLayoutId, widgetId, viewId } =
    RECORD_TABLE_WIDGET_SETTINGS_STORY_DATA;
  const objectMetadataItem = getMockObjectMetadataItemOrThrow('opportunity');
  useListenClickOutside({
    listenerId: 'table-widget-settings-background',
    excludedClickOutsideIds: [SIDE_PANEL_CLICK_OUTSIDE_ID],
    refs: [],
    callback: onBackgroundClickOutside,
  });

  return (
    <SidePanelPageComponentInstanceContext.Provider
      value={{ instanceId: pageLayoutId }}
    >
      <PageLayoutSidePanelTargetContext.Provider
        value={{
          pageLayoutId,
          targetRecordIdentifier: {
            targetObjectNameSingular: 'opportunity',
            id: 'record-table-widget-story-record',
          },
        }}
      >
        <ParentClickOutsideIdContext.Provider
          value={SIDE_PANEL_CLICK_OUTSIDE_ID}
        >
          <StyledPanel data-click-outside-id={SIDE_PANEL_CLICK_OUTSIDE_ID}>
            {shouldShowLayoutRowsOnly ? (
              <SelectableList
                selectableListInstanceId={SIDE_PANEL_SELECTABLE_LIST_ID}
                focusId={SIDE_PANEL_FOCUS_ID}
                selectableItemIdArray={[
                  'object-view-layout',
                  'record-table-calendar-field',
                  'record-table-calendar-layout',
                  'record-table-group-by',
                  'record-table-hide-empty-groups',
                ]}
              >
                <WidgetViewLayoutSettingsRows
                  pageLayoutId={pageLayoutId}
                  widgetId={widgetId}
                  viewId={viewId}
                  objectMetadataId={objectMetadataItem.id}
                />
              </SelectableList>
            ) : (
              <SidePanelDashboardRecordTableSettings />
            )}
          </StyledPanel>
        </ParentClickOutsideIdContext.Provider>
      </PageLayoutSidePanelTargetContext.Provider>
    </SidePanelPageComponentInstanceContext.Provider>
  );
};
