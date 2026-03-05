import { styled } from '@linaria/react';

import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
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

export const StyledApisFieldTableRow = styled(TableRow)`
  grid-template-columns: 1fr 28px;
`;

const StyledIconTableCell = styled(TableCell)`
  justify-content: center;
  padding-right: ${themeCssVariables.spacing[1]};
  padding-left: 0;
`;

const StyledUrlTableCell = styled(TableCell)`
  color: ${themeCssVariables.font.color.primary};
  overflow: hidden;
`;

const StyledIconChevronRight = styled(IconChevronRight)`
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
          size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.md)}
          stroke={resolveThemeVariableAsNumber(
            themeCssVariables.icon.stroke.sm,
          )}
        />
      </StyledIconTableCell>
    </StyledApisFieldTableRow>
  );
};
