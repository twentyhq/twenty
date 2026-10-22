import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { SIDE_PANEL_CLICK_OUTSIDE_ID } from '@/side-panel/constants/SidePanelClickOutsideId';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { SIDE_PANEL_SELECTABLE_LIST_ID } from '@/side-panel/constants/SidePanelSelectableListId';
import { ChartSettingItem } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingItem';
import { CHART_SETTINGS_STORY_DATA } from '@/side-panel/pages/page-layout/components/__stories__/chartSettingsStoryData';
import { PageLayoutSidePanelTargetContext } from '@/side-panel/pages/page-layout/contexts/PageLayoutSidePanelTargetContext';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { assertChartWidgetOrThrow } from '@/side-panel/pages/page-layout/utils/assertChartWidgetOrThrow';
import { type ChartSettingsItem } from '@/side-panel/pages/page-layout/types/ChartSettingsGroup';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { type ReactNode } from 'react';

const StyledPanel = styled.div`
  margin-left: auto;
  margin-top: 32px;
  width: 320px;
`;

type ChartSettingsStoryProps = {
  items: ChartSettingsItem[];
  children?: ReactNode;
  onBackgroundClickOutside?: () => void;
};

const handleBackgroundClickOutside = () => {};

export const ChartSettingsStory = ({
  items,
  children,
  onBackgroundClickOutside = handleBackgroundClickOutside,
}: ChartSettingsStoryProps) => {
  const { pageLayoutId } = CHART_SETTINGS_STORY_DATA;
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  useListenClickOutside({
    listenerId: 'chart-settings-background',
    excludedClickOutsideIds: [SIDE_PANEL_CLICK_OUTSIDE_ID],
    refs: [],
    callback: onBackgroundClickOutside,
  });

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  assertChartWidgetOrThrow(widgetInEditMode);

  return (
    <SidePanelPageComponentInstanceContext.Provider
      value={{ instanceId: CHART_SETTINGS_STORY_DATA.pageLayoutId }}
    >
      <PageLayoutSidePanelTargetContext.Provider
        value={{
          pageLayoutId,
          targetRecordIdentifier: {
            targetObjectNameSingular: 'opportunity',
            id: 'chart-story-record',
          },
        }}
      >
        <ParentClickOutsideIdContext.Provider
          value={SIDE_PANEL_CLICK_OUTSIDE_ID}
        >
          <StyledPanel data-click-outside-id={SIDE_PANEL_CLICK_OUTSIDE_ID}>
            <SelectableList
              selectableListInstanceId={SIDE_PANEL_SELECTABLE_LIST_ID}
              focusId={SIDE_PANEL_FOCUS_ID}
              selectableItemIdArray={items.map((item) => item.id)}
            >
              {items.map((item) => (
                <ChartSettingItem
                  key={item.id}
                  item={item}
                  objectMetadataId={widgetInEditMode.objectMetadataId}
                  configuration={widgetInEditMode.configuration}
                />
              ))}
              {children}
            </SelectableList>
          </StyledPanel>
        </ParentClickOutsideIdContext.Provider>
      </PageLayoutSidePanelTargetContext.Provider>
    </SidePanelPageComponentInstanceContext.Provider>
  );
};
