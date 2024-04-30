import { createContext } from 'react';

import { SettingsIntegration } from '@/settings/integrations/types/SettingsIntegration';
import { RemoteServer, RemoteTable } from '~/generated-metadata/graphql';

type DatabaseConnectionContextValue = {
  connection: RemoteServer | undefined;
  integration: SettingsIntegration | undefined;
  databaseKey: string;
  tables: RemoteTable[] | undefined;
};

export const DatabaseConnectionContext =
  createContext<DatabaseConnectionContextValue>({
    connection: undefined,
    integration: undefined,
    databaseKey: '',
    tables: undefined,
  });
