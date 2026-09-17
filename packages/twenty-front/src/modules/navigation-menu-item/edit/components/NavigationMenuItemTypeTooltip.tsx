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
import {
  AppTooltip,
  TooltipDelay,
  TooltipPosition,
} from 'twenty-ui/primitives/surfaces';
import { useTheme } from 'twenty-ui/theme-constants';

type NavigationMenuItemTypeTooltipProps = {
  type: NavigationMenuItemType;
  anchorId: string;
  hidden: boolean;
};

export const NavigationMenuItemTypeTooltip = ({
  type,
  anchorId,
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

  return (
    <AppTooltip
      delay={TooltipDelay.mediumDelay}
      anchorSelect={`#${anchorId}`}
      title={labelsByType[type].label}
      description={
        type === NavigationMenuItemType.FOLDER ? t`Click to edit` : undefined
      }
      Icon={labelsByType[type].Icon}
      offset={theme.spacingMultiplicator}
      hidden={hidden}
      place={TooltipPosition.Top}
      positionStrategy="fixed"
    />
  );
};
