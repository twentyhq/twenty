import { type ReactElement } from 'react';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import {
  IconAddressBook,
  IconBox,
  IconHeart,
  IconInbox,
  IconLego,
  IconMessage,
  IconFolder,
  IconHash,
  IconLayoutList,
  IconLayoutSidebar,
  IconLink,
  IconPerspective,
  IconTable,
  type IconComponent,
} from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { useTheme } from 'twenty-ui/theme';

type NavigationMenuItemTypeTooltipProps = {
  type: NavigationMenuItemType;
  children: ReactElement;
  hidden: boolean;
};

export const NavigationMenuItemTypeTooltip = ({
  type,
  children,
  hidden,
}: NavigationMenuItemTypeTooltipProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const labelsByType: Record<
    NavigationMenuItemType,
    { label: string; Icon: IconComponent }
  > = {
    OBJECT: { label: t`Object`, Icon: IconBox },
    VIEW: { label: t`View`, Icon: IconTable },
    RECORD: { label: t`Record`, Icon: IconAddressBook },
    LINK: { label: t`Link`, Icon: IconLink },
    FOLDER: { label: t`Folder`, Icon: IconFolder },
    PAGE_LAYOUT: { label: t`Page`, Icon: IconPerspective },
    AGENT_CHAT_CHANNEL: { label: t`Channel`, Icon: IconHash },
    TAB: { label: t`Tab`, Icon: IconLayoutSidebar },
    SECTION: { label: t`Section`, Icon: IconLayoutList },
    AI_CHAT_TRIAGE: { label: t`Inbox`, Icon: IconInbox },
    AI_CHAT_FAVORITES: { label: t`Favorite chats`, Icon: IconHeart },
    AI_CHAT_CHANNELS: { label: t`Channels`, Icon: IconHash },
    AI_CHAT_RECENTS: { label: t`Recent chats`, Icon: IconMessage },
    AI_AGENTS: { label: t`Agents`, Icon: IconLego },
  };

  const { label, Icon } = labelsByType[type];

  return (
    <Tooltip
      delay={TooltipDelay.mediumDelay}
      content={label}
      description={
        type === NavigationMenuItemType.FOLDER ? t`Click to edit` : undefined
      }
      startIcon={<Icon size={theme.icon.size.sm} />}
      sideOffset={theme.spacingMultiplicator}
      disabled={hidden}
      onOpenChange={(...openChangeArguments) => {
        const [open, eventDetails] = openChangeArguments;
        const isDescendantFocus =
          eventDetails.reason === 'trigger-focus' &&
          eventDetails.event.target !== eventDetails.trigger;

        if (open && isDescendantFocus) {
          eventDetails.cancel();
        }
      }}
      side="top"
      positionMethod="fixed"
    >
      {children}
    </Tooltip>
  );
};
