import { Navigate, useParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { SettingsMcpServerDetail } from '@/settings/mcp-servers/components/SettingsMcpServerDetail';

export const SettingsDevelopersMcpServerDetail = () => {
  const { mcpServerId } = useParams<{ mcpServerId: string }>();

  if (!isDefined(mcpServerId) || !isValidUuid(mcpServerId)) {
    return <Navigate to={AppPath.NotFound} replace />;
  }

  return <SettingsMcpServerDetail mcpServerId={mcpServerId} />;
};
