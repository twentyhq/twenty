import identity from 'lodash.identity';
import isEmpty from 'lodash.isempty';
import pickBy from 'lodash.pickby';
import { z } from 'zod';

import {
  settingsIntegrationPostgreSQLConnectionFormSchema,
  settingsIntegrationStripeConnectionFormSchema,
} from '@/settings/integrations/database-connection/components/SettingsIntegrationDatabaseConnectionForm';
import { CustomError } from 'twenty-shared/utils';
import { type RemoteServer } from '~/generated-metadata/graphql';

export const getEditionSchemaForForm = (databaseKey: string) => {
  switch (databaseKey) {
    case 'postgresql':
      return settingsIntegrationPostgreSQLConnectionFormSchema.extend({
        password: z.string().optional(),
      });
    case 'stripe':
      return settingsIntegrationStripeConnectionFormSchema;
    default:
      throw new CustomError(
        `No schema found for database key: ${databaseKey}`,
        'NO_SCHEMA_FOUND',
      );
  }
};

export const getFormDefaultValuesFromConnection = ({
  databaseKey,
  connection,
}: {
  databaseKey: string;
  connection: RemoteServer;
}) => {
  switch (databaseKey) {
    case 'postgresql':
      return {
        dbname: connection.foreignDataWrapperOptions.dbname,
        host: connection.foreignDataWrapperOptions.host,
        port: connection.foreignDataWrapperOptions.port,
        user: connection.userMappingOptions?.user || undefined,
        schema: connection.schema || undefined,
        label: connection.label,
        password: '',
      };
    case 'stripe':
      return {
        api_key: connection.foreignDataWrapperOptions.api_key,
        label: connection.label,
      };
    default:
      throw new Error(
        `No default form values for database key: ${databaseKey}`,
      );
  }
};

export const formatValuesForUpdate = ({
  databaseKey,
  formValues,
}: {
  databaseKey: string;
  formValues: any;
}) => {
  switch (databaseKey) {
    case 'postgresql': {
      const formattedValues = {
        userMappingOptions: pickBy(
          {
            user: formValues.user,
            password: formValues.password,
          },
          identity,
        ),
        foreignDataWrapperOptions: pickBy(
          {
            dbname: formValues.dbname,
            host: formValues.host,
            port: formValues.port,
          },
          identity,
        ),
        schema: formValues.schema,
        label: formValues.label,
      };

      return pickBy(formattedValues, (obj) => !isEmpty(obj));
    }
    case 'stripe':
      return {
        foreignDataWrapperOptions: {
          api_key: formValues.api_key,
        },
        label: formValues.label,
      };
    default:
      throw new CustomError(
        `Cannot format values for database key: ${databaseKey}`,
        'CANNOT_FORMAT_VALUES',
      );
  }
};
