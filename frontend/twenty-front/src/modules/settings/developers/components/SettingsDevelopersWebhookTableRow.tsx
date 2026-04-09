import { styled } from '@linaria/react';

import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { getUrlHostnameOrThrow, isValidUrl } from 'twenty-shared/utils';
import {
  IconChevronRight,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { type Webhook } from '~/generated-metadata/graphql';

const WEBHOOK_TABLE_ROW_GRID_TEMPLATE_COLUMNS = '1fr 28px';

const StyledIconChevronRightContainer = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
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
  const { theme } = useContext(ThemeContext);
  return (
    <TableRow
      gridTemplateColumns={WEBHOOK_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
      to={to}
    >
      <TableCell color={themeCssVariables.font.color.primary} overflow="hidden">
        <OverflowingTextWithTooltip
          text={
            isValidUrl(webhook.targetUrl)
              ? getUrlHostnameOrThrow(webhook.targetUrl)
              : webhook.targetUrl
          }
        />
      </TableCell>
      <TableCell
        align="center"
        padding={`0 ${themeCssVariables.spacing[1]} 0 0`}
      >
        <StyledIconChevronRightContainer>
          <IconChevronRight
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        </StyledIconChevronRightContainer>
      </TableCell>
    </TableRow>
  );
};
