import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/react';
import { useId, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  IconAddressBook,
  IconBook,
  IconPaperclip,
  IconPlus,
} from 'twenty-ui/icon';

import { InboxAddMenuRecordsPage } from '@/ai/components/InboxAddMenuRecordsPage';
import { InboxAddMenuSkillsPage } from '@/ai/components/InboxAddMenuSkillsPage';
import { InboxFileInput } from '@/ai/components/internal/InboxFileInput';
import { INBOX_ADD_MENU_PAGE } from '@/ai/constants/InboxAddMenuPage';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';

const INBOX_ADD_MENU_WIDTH_PX = 280;

type InboxAddMenuProps = {
  editor: Editor | null;
};

export const InboxAddMenu = ({ editor }: InboxAddMenuProps) => {
  const { t } = useLingui();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const instanceId = useId();

  return (
    <>
      <InboxFileInput ref={fileInputRef} />
      <DropdownRoot
        dropdownId={`ai-chat-add-menu-${instanceId}`}
        type="menu"
        defaultPage={INBOX_ADD_MENU_PAGE.ROOT}
      >
        <Dropdown.Trigger
          render={
            <IconButton
              variant="ghost"
              size="sm"
              aria-label={t`Add files, records or skills`}
            >
              <IconPlus />
            </IconButton>
          }
        />
        <DropdownContent
          width={INBOX_ADD_MENU_WIDTH_PX}
          side="top"
          align="start"
          sideOffset={8}
          finalFocus={(interaction) =>
            interaction === 'keyboard' && isDefined(editor)
              ? editor.view.dom
              : false
          }
          aria-label={t`Add files, records or skills`}
        >
          <Dropdown.Page id={INBOX_ADD_MENU_PAGE.ROOT} type="menu">
            <Dropdown.Section>
              <Dropdown.ActionItem
                startIcon={<IconPaperclip />}
                onClick={() => {
                  editor?.view.focus();
                  fileInputRef.current?.click();
                }}
              >
                {t`Attach files`}
              </Dropdown.ActionItem>
              <Dropdown.ActionItem
                startIcon={<IconAddressBook />}
                shortcut={['@']}
                page={INBOX_ADD_MENU_PAGE.RECORDS}
              >
                {t`Records`}
              </Dropdown.ActionItem>
              <Dropdown.ActionItem
                startIcon={<IconBook />}
                shortcut={['/']}
                page={INBOX_ADD_MENU_PAGE.SKILLS}
              >
                {t`Skills`}
              </Dropdown.ActionItem>
            </Dropdown.Section>
          </Dropdown.Page>
          <Dropdown.Page id={INBOX_ADD_MENU_PAGE.RECORDS} type="picker">
            <InboxAddMenuRecordsPage editor={editor} />
          </Dropdown.Page>
          <Dropdown.Page id={INBOX_ADD_MENU_PAGE.SKILLS} type="picker">
            <InboxAddMenuSkillsPage editor={editor} />
          </Dropdown.Page>
        </DropdownContent>
      </DropdownRoot>
    </>
  );
};
