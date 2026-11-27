import { plural, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ThemeColor } from 'twenty-ui/theme';
import {
  type McpServer,
  type McpServerTool,
} from '~/generated-metadata/graphql';

type McpServerStatus = {
  color: ThemeColor;
  label: string;
};

export const getMcpServerStatus = (
  mcpServer: Pick<McpServer, 'isActive' | 'toolsSyncError'> & {
    tools: Pick<McpServerTool, 'name'>[];
  },
): McpServerStatus => {
  if (!mcpServer.isActive) {
    return { color: 'gray', label: t`Inactive` };
  }

  if (isNonEmptyString(mcpServer.toolsSyncError)) {
    return { color: 'red', label: t`Sync failed` };
  }

  const toolCount = mcpServer.tools.length;

  return {
    color: toolCount > 0 ? 'green' : 'gray',
    label: plural(toolCount, { one: '# tool', other: '# tools' }),
  };
};
