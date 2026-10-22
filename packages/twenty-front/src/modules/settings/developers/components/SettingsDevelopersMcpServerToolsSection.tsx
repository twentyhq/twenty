import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { type McpServer } from '~/generated-metadata/graphql';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const TOOLS_TABLE_GRID_TEMPLATE_COLUMNS = '1fr 2fr';

const StyledSyncStatus = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledSyncError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
  word-break: break-word;
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledEmptyState = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

type SettingsDevelopersMcpServerToolsSectionProps = {
  mcpServer: Pick<McpServer, 'toolsSyncedAt' | 'toolsSyncError'> & {
    tools: Pick<McpServer['tools'][number], 'name' | 'description'>[];
  };
  isSyncing: boolean;
  onSync: () => void;
};

export const SettingsDevelopersMcpServerToolsSection = ({
  mcpServer,
  isSyncing,
  onSync,
}: SettingsDevelopersMcpServerToolsSectionProps) => {
  const { t } = useLingui();

  const syncedAt = isDefined(mcpServer.toolsSyncedAt)
    ? beautifyPastDateRelativeToNow(mcpServer.toolsSyncedAt)
    : null;

  return (
    <Section.Root>
      <Section.Header
        title={t`Tools`}
        description={t`Tools this server exposes to the AI chat. The list is cached and refreshed when the server settings change.`}
      />
      {mcpServer.tools.length > 0 ? (
        <Table>
          <TableRow gridTemplateColumns={TOOLS_TABLE_GRID_TEMPLATE_COLUMNS}>
            <TableHeader>{t`Name`}</TableHeader>
            <TableHeader>{t`Description`}</TableHeader>
          </TableRow>
          <TableBody>
            {mcpServer.tools.map((tool) => (
              <TableRow
                key={tool.name}
                gridTemplateColumns={TOOLS_TABLE_GRID_TEMPLATE_COLUMNS}
              >
                <TableCell
                  color={themeCssVariables.font.color.primary}
                  overflow="hidden"
                >
                  <OverflowingTextWithTooltip text={tool.name} />
                </TableCell>
                <TableCell
                  color={themeCssVariables.font.color.tertiary}
                  overflow="hidden"
                >
                  <OverflowingTextWithTooltip text={tool.description ?? ''} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <StyledEmptyState>{t`No tools fetched yet.`}</StyledEmptyState>
      )}
      {isNonEmptyString(mcpServer.toolsSyncError) && (
        <StyledSyncError>
          {t`Last refresh failed: ${mcpServer.toolsSyncError}`}
        </StyledSyncError>
      )}
      <StyledFooter>
        <StyledSyncStatus>
          {isDefined(syncedAt) ? t`Refreshed ${syncedAt}` : t`Never refreshed`}
        </StyledSyncStatus>
        <Button
          startIcon={<IconRefresh />}
          size="sm"
          variant="outline"
          loading={isSyncing}
          disabled={isSyncing}
          onClick={onSync}
        >{t`Refresh tools`}</Button>
      </StyledFooter>
    </Section.Root>
  );
};
