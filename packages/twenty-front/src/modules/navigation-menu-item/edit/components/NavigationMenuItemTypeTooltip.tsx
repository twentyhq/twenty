import { type ReactElement, type ReactNode } from 'react';
import { CoreAgentIcon } from '@/object-core/agents/components/CoreAgentIcon';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import {
  IconAddressBook,
  IconCompass,
  IconBox,
  IconFolder,
  IconHash,
  IconLink,
  IconPerspective,
  IconSettingsAutomation,
  IconTable,
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

  const iconSize = theme.icon.size.sm;

  const labelsByType: Record<
    NavigationMenuItemType,
    { label: string; icon: ReactNode }
  > = {
    OBJECT: { label: t`Object`, icon: <IconBox size={iconSize} /> },
    VIEW: { label: t`View`, icon: <IconTable size={iconSize} /> },
    RECORD: { label: t`Record`, icon: <IconAddressBook size={iconSize} /> },
    LINK: { label: t`Link`, icon: <IconLink size={iconSize} /> },
    FOLDER: { label: t`Folder`, icon: <IconFolder size={iconSize} /> },
    PAGE_LAYOUT: { label: t`Page`, icon: <IconPerspective size={iconSize} /> },
    AGENT_CHAT_CHANNEL: {
      label: t`Channel`,
      icon: <IconHash size={iconSize} />,
    },
    WORKFLOW: {
      label: t`Workflow`,
      icon: <IconSettingsAutomation size={iconSize} />,
    },
    AGENT: { label: t`Agent`, icon: <CoreAgentIcon size={14} /> },
    NATIVE_PAGE: {
      label: t`Native page`,
      icon: <IconCompass size={iconSize} />,
    },
  };

  const { label, icon } = labelsByType[type];

  return (
    <Tooltip
      delay={TooltipDelay.mediumDelay}
      content={label}
      description={
        type === NavigationMenuItemType.FOLDER ? t`Click to edit` : undefined
      }
      startIcon={icon}
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
