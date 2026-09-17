import { type ReactElement } from 'react';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import {
  IconAddressBook,
  IconBox,
  IconFolder,
  IconLink,
  IconPerspective,
  IconTable,
  type IconComponent,
} from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { useTheme } from 'twenty-ui/theme-constants';

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
  };

  const { label, Icon } = labelsByType[type];

  return (
    <Tooltip
      delay={TooltipDelay.mediumDelay}
      content={
        <Tooltip.Content
          description={
            type === NavigationMenuItemType.FOLDER
              ? t`Click to edit`
              : undefined
          }
          startIcon={<Icon size={theme.icon.size.sm} />}
        >
          {label}
        </Tooltip.Content>
      }
      sideOffset={theme.spacingMultiplicator}
      disabled={hidden}
      side="top"
      positionMethod="fixed"
    >
      {children}
    </Tooltip>
  );
};
