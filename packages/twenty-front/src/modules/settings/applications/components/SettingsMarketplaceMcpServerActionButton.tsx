import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { Link } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { IconPlus, IconSettings } from 'twenty-ui/icon';

import { useAddMarketplaceMcpServer } from '@/settings/mcp-servers/hooks/useAddMarketplaceMcpServer';
import { FindManyMcpServersDocument } from '~/generated-metadata/graphql';

type SettingsMarketplaceMcpServerActionButtonProps = {
  universalIdentifier: string;
};

export const SettingsMarketplaceMcpServerActionButton = ({
  universalIdentifier,
}: SettingsMarketplaceMcpServerActionButtonProps) => {
  const { t } = useLingui();
  const { data, loading: isLoading } = useQuery(FindManyMcpServersDocument);
  const { addMarketplaceMcpServer, isAdding } = useAddMarketplaceMcpServer();

  if (isLoading) {
    return null;
  }

  const addedMcpServer = data?.mcpServers.find(
    (mcpServer) => mcpServer.universalIdentifier === universalIdentifier,
  );

  if (isDefined(addedMcpServer)) {
    return (
      <Button
        startIcon={<IconSettings />}
        variant="outline"
        size="sm"
        nativeButton={false}
        role="link"
        render={
          <Link
            to={getSettingsPath(SettingsPath.AiMcpServerDetail, {
              mcpServerId: addedMcpServer.id,
            })}
          />
        }
      >{t`Manage`}</Button>
    );
  }

  return (
    <Button
      startIcon={<IconPlus />}
      variant="solid"
      color="accent"
      size="sm"
      disabled={isAdding}
      onClick={() => addMarketplaceMcpServer(universalIdentifier)}
    >{t`Add to workspace`}</Button>
  );
};
