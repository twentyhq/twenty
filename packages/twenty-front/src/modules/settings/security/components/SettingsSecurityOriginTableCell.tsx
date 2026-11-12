import { IconWorld } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { getOriginFaviconUrl } from '@/settings/security/utils/getOriginFaviconUrl';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type SettingsSecurityOriginTableCellProps = {
  origin: string;
};

export const SettingsSecurityOriginTableCell = ({
  origin,
}: SettingsSecurityOriginTableCellProps) => {
  const theme = useTheme();
  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );

  const faviconUrl = getOriginFaviconUrl({
    origin,
    allowRequestsToTwentyIcons,
  });

  return (
    <TableCell
      color={themeCssVariables.font.color.primary}
      gap={themeCssVariables.spacing[2]}
      minWidth="0"
      overflow="hidden"
    >
      <Avatar.Root
        size="md"
        shape="square"
        backgroundColor="transparent"
        aria-hidden
      >
        <Avatar.Image src={faviconUrl} alt="" />
        <Avatar.Fallback render={<IconWorld size={theme.icon.size.md} />} />
      </Avatar.Root>
      <OverflowingTextWithTooltip text={origin} />
    </TableCell>
  );
};
