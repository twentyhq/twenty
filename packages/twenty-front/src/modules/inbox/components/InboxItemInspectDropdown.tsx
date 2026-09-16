import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type JsonValue } from 'type-fest';
import { IconCode } from 'twenty-ui/icon';
import { JsonTree } from 'twenty-ui/primitives/json-visualizer';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxTooltipIconButton } from '@/inbox/components/InboxTooltipIconButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { type InboxItem } from '~/generated/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const INSPECT_MENU_WIDTH = 480;

const StyledTree = styled.div`
  max-height: 60vh;
  overflow: auto;
  padding: ${themeCssVariables.spacing[2]};
`;

type InboxItemInspectDropdownProps = {
  inboxItem: InboxItem;
};

// The item as the client holds it, calls and records included, for checking
// what a producer wrote without a database.
export const InboxItemInspectDropdown = ({
  inboxItem,
}: InboxItemInspectDropdownProps) => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();

  return (
    <Dropdown
      dropdownId={`inbox-inspect-${inboxItem.id}`}
      dropdownPlacement="bottom-end"
      clickableComponent={
        <InboxTooltipIconButton
          Icon={IconCode}
          accent="tertiary"
          label={t`Inspect item`}
        />
      }
      dropdownComponents={
        <DropdownContent widthInPixels={INSPECT_MENU_WIDTH}>
          <DropdownMenuHeader>{t`Inbox item`}</DropdownMenuHeader>
          <StyledTree>
            <JsonTree
              value={inboxItem as unknown as JsonValue}
              shouldExpandNodeInitially={() => true}
              emptyArrayLabel={t`Empty Array`}
              emptyObjectLabel={t`Empty Object`}
              emptyStringLabel={t`[empty string]`}
              arrowButtonCollapsedLabel={t`Expand`}
              arrowButtonExpandedLabel={t`Collapse`}
              onNodeValueClick={copyToClipboard}
            />
          </StyledTree>
        </DropdownContent>
      }
    />
  );
};
