import { useParams } from 'react-router-dom';

import { SettingsMcpServerDetail } from '@/settings/mcp-servers/components/SettingsMcpServerDetail';

export const SettingsDevelopersMcpServerDetail = () => {
  const { mcpServerId } = useParams<{ mcpServerId: string }>();

  return <SettingsMcpServerDetail mcpServerId={mcpServerId} />;
};
