import { isNonEmptyString } from '@sniptt/guards';
import { Status } from 'twenty-ui/primitives/data-display';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

import { getMcpServerStatus } from '@/settings/mcp-servers/utils/getMcpServerStatus';
import { type McpServer } from '~/generated-metadata/graphql';

type SettingsMcpServerStatusProps = {
  mcpServer: Pick<McpServer, 'isActive' | 'toolsSyncError'> & {
    tools: unknown[];
  };
};

export const SettingsMcpServerStatus = ({
  mcpServer,
}: SettingsMcpServerStatusProps) => {
  const { color, label } = getMcpServerStatus(mcpServer);
  const status = (
    <Status color={color} weight="medium">
      {label}
    </Status>
  );

  if (mcpServer.isActive && isNonEmptyString(mcpServer.toolsSyncError)) {
    return <Tooltip content={mcpServer.toolsSyncError}>{status}</Tooltip>;
  }

  return status;
};
