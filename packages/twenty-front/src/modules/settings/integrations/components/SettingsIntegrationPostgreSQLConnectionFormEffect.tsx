import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { getFormDefaultValuesFromConnection } from '@/settings/integrations/utils/editDatabaseConnection';
import { RemoteServer } from '~/generated-metadata/graphql';

type SettingsIntegrationPostgreSQLConnectionFormEffectProps = {
  formConfig: UseFormReturn<any>;
  databaseKey: string;
  connection?: RemoteServer | null;
};

export const SettingsIntegrationPostgreSQLConnectionFormEffect = ({
  formConfig,
  databaseKey,
  connection,
}: SettingsIntegrationPostgreSQLConnectionFormEffectProps) => {
  useEffect(() => {
    formConfig.reset(
      getFormDefaultValuesFromConnection({ databaseKey, connection }),
    );
  }, [formConfig, databaseKey, connection]);

  return <></>;
};
