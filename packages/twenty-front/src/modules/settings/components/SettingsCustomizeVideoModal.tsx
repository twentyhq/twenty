import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type SettingsCustomizeVideoModalTab } from '@/settings/types/SettingsCustomizeVideoModalTab';
import { TabListRoot } from '@/ui/layout/tab-list/components/TabListRoot';
import { Tabs } from 'twenty-ui/primitives/navigation';
import { t } from '@lingui/core/macro';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { styled } from '@linaria/react';
import { IconX } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/components';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

type SettingsCustomizeVideoModalProps = {
  modalInstanceId: string;
  tabsInstanceId: string;
  tabs: SettingsCustomizeVideoModalTab[];
};

// the tab list draws its own separator, so the header only needs one when the
// single tab is replaced by a plain title
const StyledHeader = styled.div<{ $hasBottomBorder: boolean }>`
  align-items: center;
  border-bottom: ${({ $hasBottomBorder }) =>
    $hasBottomBorder
      ? `1px solid ${themeCssVariables.border.color.light}`
      : 'none'};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: 48px;
  justify-content: space-between;
  padding-right: ${themeCssVariables.spacing[3]};
`;

const StyledTabsContainer = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  padding-left: ${themeCssVariables.spacing[3]};
`;

const StyledTitle = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1 1 auto;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  padding-left: ${themeCssVariables.spacing[5]};

  & > svg {
    flex-shrink: 0;
  }
`;

const StyledTitleText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledVideoContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[6]};
`;

const StyledVideoIframe = styled.iframe`
  aspect-ratio: 1440 / 900;
  border: 0;
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  display: block;
  height: auto;
  max-width: 100%;
  width: 960px;
`;

export const SettingsCustomizeVideoModal = ({
  modalInstanceId,
  tabsInstanceId,
  tabs,
}: SettingsCustomizeVideoModalProps) => {
  const theme = useTheme();
  const { closeDialog } = useDialog();
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    tabsInstanceId,
  );

  if (tabs.length === 0) {
    return null;
  }

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const hasMultipleTabs = tabs.length > 1;
  const ActiveTabIcon = activeTab.Icon;

  const handleClose = () => {
    closeDialog(modalInstanceId);
  };

  const videoContent = (
    <StyledVideoContainer>
      <StyledVideoIframe
        key={activeTab.id}
        src={
          activeTab.hasSound
            ? `https://player.vimeo.com/video/${activeTab.vimeoId}?byline=0&portrait=0&title=0&vimeo_logo=0&app_id=58479&dnt=1`
            : `https://player.vimeo.com/video/${activeTab.vimeoId}?autoplay=1&loop=1&autopause=0&background=1&muted=1&dnt=1`
        }
        allow="autoplay; fullscreen; picture-in-picture"
        title={activeTab.title}
      />
    </StyledVideoContainer>
  );

  return (
    <DialogInstance
      dialogId={modalInstanceId}
      dismissible
      onClose={handleClose}
      renderInDocumentBody
    >
      {({ container, backdrop, viewportProps, onKeyDown }) => (
        <Dialog.Popup
          aria-label={activeTab.title}
          {...{ container, backdrop, viewportProps, onKeyDown }}
          size="lg"
          style={{ padding: 0 }}
        >
          <TabListRoot
            componentInstanceId={tabsInstanceId}
            enabled={hasMultipleTabs}
          >
            <StyledHeader $hasBottomBorder={!hasMultipleTabs}>
              {hasMultipleTabs ? (
                <StyledTabsContainer>
                  <TabList
                    aria-label={t`Video tutorials`}
                    tabs={tabs}
                    behaveAsLinks={false}
                    componentInstanceId={tabsInstanceId}
                  />
                </StyledTabsContainer>
              ) : (
                <StyledTitle>
                  <ActiveTabIcon
                    size={theme.icon.size.md}
                    color={theme.font.color.primary}
                    aria-hidden
                  />
                  <StyledTitleText>{activeTab.title}</StyledTitleText>
                </StyledTitle>
              )}
              <IconButton
                aria-label={t`Close video`}
                onClick={handleClose}
                size="sm"
              >
                <IconX />
              </IconButton>
            </StyledHeader>
            {hasMultipleTabs ? (
              <Tabs.Panel value={activeTab.id}>{videoContent}</Tabs.Panel>
            ) : (
              videoContent
            )}
          </TabListRoot>
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};
