import { styled } from '@linaria/react';

import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';

export const WEBHOOK_TABLE_ROW_GRID_TEMPLATE_COLUMNS = '1fr 28px';
import { getUrlHostnameOrThrow, isValidUrl } from 'twenty-shared/utils';
import {
  IconChevronRight,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from 'twenty-ui/theme-constants';
import { type Webhook } from '~/generated-metadata/graphql';

const StyledIconChevronRightContainer = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
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
            size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.md)}
            stroke={resolveThemeVariableAsNumber(
              themeCssVariables.icon.stroke.sm,
            )}
          />
        </StyledIconChevronRightContainer>
      </TableCell>
    </TableRow>
  );
};
