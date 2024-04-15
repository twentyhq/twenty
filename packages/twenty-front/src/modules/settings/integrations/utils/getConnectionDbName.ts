import { SettingsIntegration } from '@/settings/integrations/types/SettingsIntegration';
import { RemoteServer } from '~/generated-metadata/graphql';

type GetConnectionDbNameParams = {
  integration: SettingsIntegration;
  connection: RemoteServer;
};

export const getConnectionDbName = ({
  integration,
  connection,
}: GetConnectionDbNameParams) =>
  integration.from.key === 'postgresql'
    ? connection.foreignDataWrapperOptions?.dbname
    : '';
