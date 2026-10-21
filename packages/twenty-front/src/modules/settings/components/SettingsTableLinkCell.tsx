import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { getUrlHostnameOrThrow, isValidUrl } from 'twenty-shared/utils';
import { RoundedLink } from '@/ui/navigation/link/components/RoundedLink/RoundedLink';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';

const StyledLinkTrigger = styled.span`
  display: inline-flex;
  min-width: 0;
`;

type SettingsTableLinkCellProps = {
  url?: string | null;
};

export const SettingsTableLinkCell = ({ url }: SettingsTableLinkCellProps) => (
  <TableCell overflow="hidden" whiteSpace="nowrap">
    {isNonEmptyString(url) && (
      <Tooltip content={url} delay={TooltipDelay.mediumDelay}>
        <StyledLinkTrigger>
          <RoundedLink
            href={url}
            label={isValidUrl(url) ? getUrlHostnameOrThrow(url) : url}
            color="secondary"
          />
        </StyledLinkTrigger>
      </Tooltip>
    )}
  </TableCell>
);
