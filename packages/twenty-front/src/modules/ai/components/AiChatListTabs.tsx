import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { TabListRoot } from '@/ui/layout/tab-list/components/TabListRoot';

const StyledContainer = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  flex-shrink: 0;
  padding-left: ${themeCssVariables.spacing[2]};
`;

type AiChatListTab = {
  id: string;
  title: string;
  Icon: IconComponent;
  pill?: string;
};

type AiChatListTabsProps = {
  componentInstanceId: string;
  tabs: AiChatListTab[];
  onChangeTab: (tabId: string) => void;
};

// The strip above a thread list, on a channel and on the personal inbox alike.
export const AiChatListTabs = ({
  componentInstanceId,
  tabs,
  onChangeTab,
}: AiChatListTabsProps) => {
  const { t } = useLingui();

  return (
    <TabListRoot componentInstanceId={componentInstanceId}>
      <StyledContainer>
        <TabList
          aria-label={t`Filter chats`}
          tabs={tabs}
          behaveAsLinks={false}
          componentInstanceId={componentInstanceId}
          onChangeTab={onChangeTab}
        />
      </StyledContainer>
    </TabListRoot>
  );
};
