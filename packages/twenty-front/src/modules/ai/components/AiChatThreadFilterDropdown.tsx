import { useLingui } from '@lingui/react/macro';
import { Dropdown, LightIconButton } from 'twenty-ui/components';
import { IconFilter } from 'twenty-ui/icon';

import { AiChatThreadFilterDropdownContent } from '@/ai/components/AiChatThreadFilterDropdownContent';
import { AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE } from '@/ai/constants/AiChatThreadFilterDropdownPage';
import { DropdownFocusEffect } from '@/ui/utilities/focus/components/DropdownFocusEffect';

export const AiChatThreadFilterDropdown = () => {
  const { t } = useLingui();

  return (
    <Dropdown.Root
      kind="menu"
      defaultPage={AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.ROOT}
    >
      <Dropdown.Trigger
        render={
          <LightIconButton
            aria-label={t`Filter chats`}
            emphasis="subtle"
            size="sm"
          >
            <IconFilter />
          </LightIconButton>
        }
      />
      <Dropdown.Content align="end" aria-label={t`Filter chats`}>
        <DropdownFocusEffect />
        <AiChatThreadFilterDropdownContent />
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
