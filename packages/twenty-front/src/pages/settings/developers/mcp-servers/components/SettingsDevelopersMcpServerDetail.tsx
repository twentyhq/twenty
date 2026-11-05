import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { SettingsMcpServerDetail } from '@/settings/mcp-servers/components/SettingsMcpServerDetail';

export const SettingsDevelopersMcpServerDetail = () => {
  const { mcpServerId } = useParams<{ mcpServerId: string }>();

  if (!isDefined(mcpServerId)) {
    return null;
  }

  return <SettingsMcpServerDetail mcpServerId={mcpServerId} />;
};
