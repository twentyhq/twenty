import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
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
  pill?: string;
};

type AiChatListTabsProps = {
  componentInstanceId: string;
  tabs: AiChatListTab[];
  onChangeTab: (tabId: string) => void;
};

// The strip above a thread list, on a channel and on the personal inbox alike.
// These panes are narrow, so the tabs scroll rather than collapsing the ones
// that do not fit into a "+N More" dropdown: four labelled tabs clear a 400px
// pane by a pixel or two, which any longer translation would eat. They carry
// labels and no icons for the same reason — a tab nobody can see is worse
// than a plain one.
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
          alwaysScrollTabs
          behaveAsLinks={false}
          componentInstanceId={componentInstanceId}
          onChangeTab={onChangeTab}
        />
      </StyledContainer>
    </TabListRoot>
  );
};
