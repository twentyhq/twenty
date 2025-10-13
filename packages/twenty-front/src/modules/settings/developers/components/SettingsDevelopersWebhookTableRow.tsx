import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { getUrlHostnameOrThrow, isValidUrl } from 'twenty-shared/utils';
import {
  IconChevronRight,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { type Webhook } from '~/generated-metadata/graphql';

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
  overflow: hidden;
`;

const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const SettingsDevelopersWebhookTableRow = ({
  webhook,
  to,
}: {
  webhook: Pick<
    Webhook,
    'id' | 'targetUrl' | 'operations' | 'description' | 'secret'
  >;
  to: string;
}) => {
  const theme = useTheme();

  return (
    <StyledApisFieldTableRow to={to}>
      <StyledUrlTableCell>
        <OverflowingTextWithTooltip
          text={
            isValidUrl(webhook.targetUrl)
              ? getUrlHostnameOrThrow(webhook.targetUrl)
              : webhook.targetUrl
          }
        />
      </StyledUrlTableCell>
      <StyledIconTableCell>
        <StyledIconChevronRight
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
      </StyledIconTableCell>
    </StyledApisFieldTableRow>
  );
};
