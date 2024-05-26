import { SettingsIntegration } from '@/settings/integrations/types/SettingsIntegration';
import { RemoteServer } from '~/generated-metadata/graphql';

type GetConnectionDbNameParams = {
  integration: SettingsIntegration;
  connection: RemoteServer;
};

export const getConnectionDbName = ({
  integration,
  connection,
}: GetConnectionDbNameParams) => {
  switch (integration.from.key) {
    case 'postgresql':
      return connection.foreignDataWrapperOptions?.dbname;
    case 'stripe':
      return connection.id;
    default:
      return '';
  }
};
