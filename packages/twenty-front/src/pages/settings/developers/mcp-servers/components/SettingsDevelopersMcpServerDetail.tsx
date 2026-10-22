import { useParams } from 'react-router-dom';

import { SettingsDevelopersMcpServerForm } from '@/settings/developers/components/SettingsDevelopersMcpServerForm';
import { McpServerFormMode } from '@/settings/developers/constants/McpServerFormMode';

export const SettingsDevelopersMcpServerDetail = () => {
  const { mcpServerId } = useParams();

  return (
    <SettingsDevelopersMcpServerForm
      mode={McpServerFormMode.Edit}
      mcpServerId={mcpServerId}
    />
  );
};
