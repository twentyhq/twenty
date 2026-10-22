import { SIDE_PANEL_CLICK_OUTSIDE_ID } from '@/side-panel/constants/SidePanelClickOutsideId';
import { SIDE_PANEL_CONSTRAINTS } from '@/side-panel/constants/SidePanelConstraints';
import { FIELD_WIDGET_SETTINGS_STORY_DATA } from '@/side-panel/pages/page-layout/components/record-page/__stories__/fieldWidgetSettingsStoryData';
import { SidePanelRecordPageFieldSettings } from '@/side-panel/pages/page-layout/components/record-page/SidePanelRecordPageFieldSettings';
import { PageLayoutSidePanelTargetContext } from '@/side-panel/pages/page-layout/contexts/PageLayoutSidePanelTargetContext';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { styled } from '@linaria/react';
import { PageLayoutType } from '~/generated-metadata/graphql';

const StyledPanel = styled.div`
  align-self: stretch;
  margin-left: auto;
  width: ${SIDE_PANEL_CONSTRAINTS.min}px;
`;

export const FieldWidgetSettingsStory = () => {
  const { pageLayoutId, recordId } = FIELD_WIDGET_SETTINGS_STORY_DATA;
  const targetRecordIdentifier = {
    targetObjectNameSingular: 'company',
    id: recordId,
  };

  return (
    <SidePanelPageComponentInstanceContext.Provider
      value={{ instanceId: pageLayoutId }}
    >
      <LayoutRenderingProvider
        value={{
          layoutType: PageLayoutType.RECORD_PAGE,
          targetRecordIdentifier,
        }}
      >
        <PageLayoutSidePanelTargetContext.Provider
          value={{ pageLayoutId, targetRecordIdentifier }}
        >
          <ParentClickOutsideIdContext.Provider
            value={SIDE_PANEL_CLICK_OUTSIDE_ID}
          >
            <StyledPanel data-click-outside-id={SIDE_PANEL_CLICK_OUTSIDE_ID}>
              <SidePanelRecordPageFieldSettings />
            </StyledPanel>
          </ParentClickOutsideIdContext.Provider>
        </PageLayoutSidePanelTargetContext.Provider>
      </LayoutRenderingProvider>
    </SidePanelPageComponentInstanceContext.Provider>
  );
};
