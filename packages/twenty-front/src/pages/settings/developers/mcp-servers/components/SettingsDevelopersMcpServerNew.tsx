import { SettingsDevelopersMcpServerForm } from '@/settings/developers/components/SettingsDevelopersMcpServerForm';
import { McpServerFormMode } from '@/settings/developers/constants/McpServerFormMode';

export const SettingsDevelopersMcpServerNew = () => {
  return <SettingsDevelopersMcpServerForm mode={McpServerFormMode.Create} />;
};
