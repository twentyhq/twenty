import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { SettingsMcpServerConnectionsTable } from '@/settings/mcp-servers/components/SettingsMcpServerConnectionsTable';
import { useTriggerMcpServerOAuth } from '@/settings/mcp-servers/hooks/useTriggerMcpServerOAuth';
import { FindManyMcpServerConnectionsDocument } from '~/generated-metadata/graphql';

const StyledActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

type SettingsMcpServerConnectionsSectionProps = {
  mcpServerId: string;
};

export const SettingsMcpServerConnectionsSection = ({
  mcpServerId,
}: SettingsMcpServerConnectionsSectionProps) => {
  const { t } = useLingui();
  const { triggerMcpServerOAuth } = useTriggerMcpServerOAuth();
  const { data, error } = useQuery(FindManyMcpServerConnectionsDocument, {
    variables: { mcpServerId },
  });

  const connections = data?.mcpServerConnections ?? [];

  return (
    <Section.Root>
      <ToastOnQueryErrorEffect
        error={error}
        message={t`Failed to load MCP server connections`}
      />
      <Section.Header
        title={t`Connections`}
        description={t`Sign in with the server's own accounts. Twenty registers itself with the server automatically.`}
        actions={
          <StyledActions>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                triggerMcpServerOAuth({
                  mcpServerId,
                  accountScope: 'WORKSPACE',
                })
              }
            >{t`Connect for workspace`}</Button>
            <Button
              startIcon={<IconPlus />}
              size="sm"
              onClick={() =>
                triggerMcpServerOAuth({ mcpServerId, accountScope: 'USER' })
              }
            >{t`Connect`}</Button>
          </StyledActions>
        }
      />
      {isNonEmptyArray(connections) && (
        <SettingsMcpServerConnectionsTable connections={connections} />
      )}
    </Section.Root>
  );
};
