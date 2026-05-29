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
  videoSrc: string;
};

type SettingsCustomizeVideoModalProps = {
  modalInstanceId: string;
  tabsInstanceId: string;
  tabs: SettingsCustomizeVideoModalTab[];
};

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
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
  background: ${themeCssVariables.background.tertiary};
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[6]};
`;

const StyledVideo = styled.video`
  // Pin the aspect ratio to the recordings' native dimensions (1440 × 900).
  // Without this, the <video> element falls back to the HTML spec's 150px
  // default intrinsic height between mount and the loadedmetadata event —
  // which collapses the container and triggers Framer Motion's layout
  // animation on the modal, reading as "modal slides up then back down".
  aspect-ratio: 1440 / 900;
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
            <StyledVideo
              // key={activeTab.id} forces a remount when the active tab changes so the new
              // video plays from frame 0 instead of resuming where the previous one paused.
              key={activeTab.id}
              src={activeTab.videoSrc}
              autoPlay
              loop
              muted
              playsInline
              aria-hidden
            />
          </StyledVideoContainer>
        </ModalStatefulWrapper>,
        document.body,
      )}
    </>
  );
};
