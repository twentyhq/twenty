import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { Navigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsMcpServerEditForm } from '@/settings/mcp-servers/components/SettingsMcpServerEditForm';
import { FindOneMcpServerDocument } from '~/generated-metadata/graphql';

type SettingsMcpServerDetailProps = {
  mcpServerId: string;
};

export const SettingsMcpServerDetail = ({
  mcpServerId,
}: SettingsMcpServerDetailProps) => {
  const { t } = useLingui();
  const { data, error } = useQuery(FindOneMcpServerDocument, {
    variables: { id: mcpServerId },
  });

  if (!isDefined(data)) {
    return (
      <>
        <ToastOnQueryErrorEffect
          error={error}
          message={t`Failed to load MCP server`}
        />
        <SettingsSkeletonLoader />
      </>
    );
  }

  if (!isDefined(data.mcpServer)) {
    return <Navigate to={AppPath.NotFound} replace />;
  }

  return (
    <SettingsMcpServerEditForm
      key={data.mcpServer.id}
      mcpServer={data.mcpServer}
    />
  );
};
