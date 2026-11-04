import { type ReactElement } from 'react';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import {
  IconAddressBook,
  IconBox,
  IconCommand,
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

import { NAVIGATION_MENU_ITEM_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuItemBuiltInSections';
import { useNavigationMenuItemSectionLabel } from '@/navigation-menu-item/common/hooks/useNavigationMenuItemSectionLabel';
import { type NavigationMenuItemBuiltInSectionType } from '@/navigation-menu-item/common/types/NavigationMenuItemBuiltInSectionType';
import { isNavigationMenuItemBuiltInSectionType } from '@/navigation-menu-item/common/utils/isNavigationMenuItemBuiltInSectionType';

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
  const { getDefaultSectionLabel } = useNavigationMenuItemSectionLabel();

  const labelsByType: Record<
    Exclude<NavigationMenuItemType, NavigationMenuItemBuiltInSectionType>,
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
    PINNED_COMMANDS: { label: t`Commands`, Icon: IconCommand },
    COMMAND: { label: t`Command`, Icon: IconCommand },
  };

  const getTypeLabelAndIcon = () => {
    if (!isNavigationMenuItemBuiltInSectionType(type)) {
      return labelsByType[type];
    }

    return {
      label: getDefaultSectionLabel(type),
      Icon: NAVIGATION_MENU_ITEM_BUILT_IN_SECTIONS[type].Icon,
    };
  };

  const { label, Icon } = getTypeLabelAndIcon();

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
