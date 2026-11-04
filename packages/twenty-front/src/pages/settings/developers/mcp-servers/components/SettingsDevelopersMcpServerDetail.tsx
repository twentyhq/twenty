import { useParams } from 'react-router-dom';

import { SettingsMcpServerForm } from '@/settings/mcp-servers/components/SettingsMcpServerForm';

export const SettingsDevelopersMcpServerDetail = () => {
  const { mcpServerId } = useParams();

  return <SettingsMcpServerForm mcpServerId={mcpServerId} />;
};
