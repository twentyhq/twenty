import { Dropdown } from 'twenty-ui/components';

import { AiChatThreadFilterDropdownGroupByMenu } from '@/ai/components/AiChatThreadFilterDropdownGroupByMenu';
import { AiChatThreadFilterDropdownLastActivityMenu } from '@/ai/components/AiChatThreadFilterDropdownLastActivityMenu';
import { AiChatThreadFilterDropdownRootMenu } from '@/ai/components/AiChatThreadFilterDropdownRootMenu';
import { AiChatThreadFilterDropdownStatusMenu } from '@/ai/components/AiChatThreadFilterDropdownStatusMenu';
import { AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE } from '@/ai/constants/AiChatThreadFilterDropdownPage';

export const AiChatThreadFilterDropdownContent = () => (
  <>
    <Dropdown.Page id={AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.ROOT} kind="menu">
      <AiChatThreadFilterDropdownRootMenu />
    </Dropdown.Page>
    <Dropdown.Page
      id={AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.STATUS}
      kind="picker"
    >
      <AiChatThreadFilterDropdownStatusMenu />
    </Dropdown.Page>
    <Dropdown.Page
      id={AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.GROUP_BY}
      kind="picker"
    >
      <AiChatThreadFilterDropdownGroupByMenu />
    </Dropdown.Page>
    <Dropdown.Page
      id={AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.LAST_ACTIVITY}
      kind="picker"
    >
      <AiChatThreadFilterDropdownLastActivityMenu />
    </Dropdown.Page>
  </>
);
