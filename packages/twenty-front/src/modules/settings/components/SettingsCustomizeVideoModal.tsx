import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { type IconComponent, IconX } from 'twenty-ui-deprecated/display';
import { IconButton } from 'twenty-ui-deprecated/input';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

export type SettingsCustomizeVideoModalTab = {
  id: string;
  title: string;
  Icon: IconComponent;
  vimeoId: string;
};

type SettingsCustomizeVideoModalProps = {
  modalInstanceId: string;
  tabsInstanceId: string;
  tabs: SettingsCustomizeVideoModalTab[];
};

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
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id ?? '');

  if (tabs.length === 0) {
    return null;
  }

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  const handleClose = () => {
    closeModal(modalInstanceId);
  };

  return (
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
          key={activeTab.id}
          src={`https://player.vimeo.com/video/${activeTab.vimeoId}?autoplay=1&loop=1&autopause=0&background=1&muted=1`}
          allow="autoplay; fullscreen; picture-in-picture"
          title={activeTab.title}
        />
      </StyledVideoContainer>
    </ModalStatefulWrapper>
  );
};
