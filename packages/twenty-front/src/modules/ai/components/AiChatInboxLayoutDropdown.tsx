import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { IconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';

import { INBOX_LAYOUT } from '@/ai/constants/AiChatInboxLayout';
import { INBOX_LAYOUT_DROPDOWN_ID } from '@/ai/constants/AiChatInboxLayoutDropdownId';
import { INBOX_LAYOUT_OPTIONS } from '@/ai/constants/AiChatInboxLayoutOptions';
import { inboxLayoutState } from '@/ai/states/aiChatInboxLayoutState';
import { type InboxLayout } from '@/ai/types/AiChatInboxLayout';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const InboxLayoutDropdown = () => {
  const { t } = useLingui();
  const [inboxLayout, setInboxLayout] = useAtomState(inboxLayoutState);
  const navigate = useNavigateApp();
  const LayoutIcon = INBOX_LAYOUT_OPTIONS[inboxLayout].Icon;

  const handleLayoutSelect = (layout: InboxLayout) => {
    setInboxLayout(layout);

    // The menu sits on the list, so the list stays on screen instead of the
    // chat open beside it
    if (layout === INBOX_LAYOUT.RECORD_PAGE) {
      // oxlint-disable-next-line twenty/no-navigate-prefer-link
      navigate(AppPath.AiChatInbox, { threadId: null });
    }
  };

  return (
    <DropdownRoot dropdownId={INBOX_LAYOUT_DROPDOWN_ID} type="menu">
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
          {Object.values(INBOX_LAYOUT).map((layout) => (
            <Dropdown.OptionItem
              key={layout}
              startIcon={
                <SelectOptionIcon Icon={INBOX_LAYOUT_OPTIONS[layout].Icon} />
              }
              selected={layout === inboxLayout}
              onSelect={() => handleLayoutSelect(layout)}
            >
              {t(INBOX_LAYOUT_OPTIONS[layout].label)}
            </Dropdown.OptionItem>
          ))}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
