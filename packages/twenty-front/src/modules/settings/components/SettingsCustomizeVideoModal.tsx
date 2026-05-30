import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { type IconComponent, IconX } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export type SettingsCustomizeVideoModalTab = {
  id: string;
  title: string;
  Icon: IconComponent;
  // Numeric Vimeo video ID. Embedded via player.vimeo.com with background=1
  // so the player autoplays muted, loops, and hides Vimeo chrome — same
  // pattern twenty-docs uses for its in-page demo videos.
  vimeoId: string;
};

type SettingsCustomizeVideoModalProps = {
  modalInstanceId: string;
  tabsInstanceId: string;
  tabs: SettingsCustomizeVideoModalTab[];
};

// No border-bottom here — the TabList renders its own baseline at the
// bottom of the row. Adding a separate header border put a second 1px line
// 1–2px off from the tab underline, producing a visible jog at the join.
const StyledHeader = styled.div`
  align-items: center;
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

const StyledVideoContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[6]};
`;

// Vimeo's "background" embed defaults to 16:9; we mirror the same width +
// aspect ratio the <video> placeholder used (960px @ 1440/900) so the modal
// doesn't reflow when we eventually swap to native recordings, and so the
// iframe has an intrinsic size on mount (no Framer-Motion layout flicker).
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
  const { closeModal } = useModal();
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  const handleClose = () => {
    closeModal(modalInstanceId);
  };

  return (
    <>
      {createPortal(
        <ModalStatefulWrapper
          modalInstanceId={modalInstanceId}
          size="large"
          padding="none"
          isClosable
          onClose={handleClose}
          renderInDocumentBody
        >
          <StyledHeader>
            <StyledTabsContainer>
              <TabList
                tabs={tabs}
                behaveAsLinks={false}
                componentInstanceId={tabsInstanceId}
                onChangeTab={(tabId) => setActiveTabId(tabId)}
              />
            </StyledTabsContainer>
            <IconButton Icon={IconX} onClick={handleClose} size="small" />
          </StyledHeader>
          <StyledVideoContainer>
            <StyledVideoIframe
              // key={activeTab.id} forces a remount when the active tab changes so the
              // new video starts from frame 0 instead of resuming the previous one.
              key={activeTab.id}
              src={`https://player.vimeo.com/video/${activeTab.vimeoId}?autoplay=1&loop=1&autopause=0&background=1&muted=1`}
              allow="autoplay; fullscreen; picture-in-picture"
              title={activeTab.title}
            />
          </StyledVideoContainer>
        </ModalStatefulWrapper>,
        document.body,
      )}
    </>
  );
};
