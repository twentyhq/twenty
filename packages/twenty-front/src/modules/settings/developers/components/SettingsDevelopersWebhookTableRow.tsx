import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconChevronRight } from 'twenty-ui';

import { Webhook } from '@/settings/developers/types/webhook/Webhook';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';

export const StyledApisFieldTableRow = styled(TableRow)`
  grid-template-columns: 1fr 28px;
`;

const StyledIconTableCell = styled(TableCell)`
  justify-content: center;
  padding-right: ${({ theme }) => theme.spacing(1)};
  padding-left: 0;
`;

const StyledUrlTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  overflow-x: scroll;
  white-space: nowrap;
`;

const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const SettingsDevelopersWebhookTableRow = ({
  fieldItem,
  to,
}: {
  fieldItem: Webhook;
  to: string;
}) => {
  const theme = useTheme();

  return (
    <StyledApisFieldTableRow to={to}>
      <StyledUrlTableCell>{fieldItem.targetUrl}</StyledUrlTableCell>
      <StyledIconTableCell>
        <StyledIconChevronRight
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
      </StyledIconTableCell>
    </StyledApisFieldTableRow>
  );
};
