import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { IconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';

import { AI_CHAT_INBOX_LAYOUT } from '@/ai/constants/AiChatInboxLayout';
import { AI_CHAT_INBOX_LAYOUT_DROPDOWN_ID } from '@/ai/constants/AiChatInboxLayoutDropdownId';
import { AI_CHAT_INBOX_LAYOUT_OPTIONS } from '@/ai/constants/AiChatInboxLayoutOptions';
import { aiChatInboxLayoutState } from '@/ai/states/aiChatInboxLayoutState';
import { type AiChatInboxLayout } from '@/ai/types/AiChatInboxLayout';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const AiChatInboxLayoutDropdown = () => {
  const { t } = useLingui();
  const [aiChatInboxLayout, setAiChatInboxLayout] = useAtomState(
    aiChatInboxLayoutState,
  );
  const navigate = useNavigateApp();
  const LayoutIcon = AI_CHAT_INBOX_LAYOUT_OPTIONS[aiChatInboxLayout].Icon;

  const handleLayoutSelect = (layout: AiChatInboxLayout) => {
    setAiChatInboxLayout(layout);

    // The menu sits on the list, so the list stays on screen instead of the
    // chat open beside it
    if (layout === AI_CHAT_INBOX_LAYOUT.RECORD_PAGE) {
      // oxlint-disable-next-line twenty/no-navigate-prefer-link
      navigate(AppPath.AiChatInbox, { threadId: null });
    }
  };

  return (
    <DropdownRoot dropdownId={AI_CHAT_INBOX_LAYOUT_DROPDOWN_ID} type="menu">
      <Dropdown.Trigger
        render={
          <IconButton
            size="sm"
            variant="outline"
            color="neutral"
            aria-label={t`Open chats in`}
          >
            <LayoutIcon />
          </IconButton>
        }
      />
      <DropdownContent align="end" aria-label={t`Open chats in`}>
        <Dropdown.Section label={t`Open chats in`}>
          {Object.values(AI_CHAT_INBOX_LAYOUT).map((layout) => (
            <Dropdown.OptionItem
              key={layout}
              startIcon={
                <SelectOptionIcon
                  Icon={AI_CHAT_INBOX_LAYOUT_OPTIONS[layout].Icon}
                />
              }
              selected={layout === aiChatInboxLayout}
              onSelect={() => handleLayoutSelect(layout)}
            >
              {t(AI_CHAT_INBOX_LAYOUT_OPTIONS[layout].label)}
            </Dropdown.OptionItem>
          ))}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
