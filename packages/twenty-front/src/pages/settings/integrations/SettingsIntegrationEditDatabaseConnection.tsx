import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { Section } from '@react-email/components';
import { identity, isEmpty, pick, pickBy } from 'lodash';
import { z } from 'zod';

import { useGetDatabaseConnection } from '@/databases/hooks/useGetDatabaseConnection';
import { useGetDatabaseConnectionTables } from '@/databases/hooks/useGetDatabaseConnectionTables';
import { useUpdateOneDatabaseConnection } from '@/databases/hooks/useUpdateOneDatabaseConnection';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsIntegrationPostgreSQLConnectionForm } from '@/settings/integrations/components/SettingsIntegrationDatabaseConnectionForm';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { getConnectionDbName } from '@/settings/integrations/utils/getConnectionDbName';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { Info } from '@/ui/display/info/components/Info';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { RemoteTableStatus } from '~/generated-metadata/graphql';
import { SettingsIntegrationDatabaseConnectionWrapper } from '~/pages/settings/integrations/SettingsIntegrationDatabaseConnectionWrapper';

export const SettingsIntegrationEditDatabaseConnection = () => {
  const { enqueueSnackBar } = useSnackBar();
  const navigate = useNavigate();
  const { databaseKey = '', connectionId = '' } = useParams();
  const [integrationCategoryAll] = useSettingsIntegrationCategories();
  const integration = integrationCategoryAll.integrations.find(
    ({ from: { key } }) => key === databaseKey,
  );

  const isPostgresqlIntegrationEnabled = useIsFeatureEnabled(
    'IS_POSTGRESQL_INTEGRATION_ENABLED',
  );
  const isIntegrationUpdateAvailable =
    !!integration &&
    databaseKey === 'postgresql' &&
    isPostgresqlIntegrationEnabled;

  const settingsIntegrationsPagePath = getSettingsPagePath(
    SettingsPath.Integrations,
  );

  const { connection, loading } = useGetDatabaseConnection({
    databaseKey,
    connectionId,
  });

  useEffect(() => {
    if (!isIntegrationUpdateAvailable || (!loading && !connection)) {
      navigate(AppPath.NotFound);
    }
  }, [navigate, connection, loading, isIntegrationUpdateAvailable]);

  const { tables } = useGetDatabaseConnectionTables({
    connectionId,
    skip: !connection,
  });

  const hasSyncedTables = tables.some(
    (table) => table?.status === RemoteTableStatus.Synced,
  );

  const editConnectionSchema = getEditionSchema(databaseKey);
  type SettingsIntegrationEditConnectionFormValues = z.infer<
    typeof editConnectionSchema
  >;

  const formConfig = useForm<SettingsIntegrationEditConnectionFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(editConnectionSchema),
    defaultValues: useMemo(() => {
      return getFormDefaultValues({ databaseKey, connection });
    }, [databaseKey, connection]),
  });

  useEffect(() => {
    formConfig.reset(getFormDefaultValues({ databaseKey, connection }));
  }, [formConfig, databaseKey, connection]);

  const { updateOneDatabaseConnection } = useUpdateOneDatabaseConnection();

  if (!isIntegrationUpdateAvailable || !connection) return null;

  const connectionName = getConnectionDbName({ integration, connection });

  const canSave =
    !hasSyncedTables &&
    formConfig.formState.isDirty &&
    formConfig.formState.isValid;

  const handleSave = async () => {
    const formValues = formConfig.getValues();
    const dirtyFieldKeys = Object.keys(
      formConfig.formState.dirtyFields,
    ) as (keyof SettingsIntegrationEditConnectionFormValues)[];

    try {
      await updateOneDatabaseConnection({
        ...formatValues({
          databaseKey,
          formValues: pick(formValues, dirtyFieldKeys),
        }),
        id: connectionId,
      });

      navigate(
        `${settingsIntegrationsPagePath}/${databaseKey}/${connectionId}`,
      );
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: 'error',
      });
    }
  };

  return (
    <SettingsIntegrationDatabaseConnectionWrapper>
      <FormProvider
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...formConfig}
      >
        <SettingsHeaderContainer>
          <Breadcrumb
            links={[
              {
                children: 'Integrations',
                href: settingsIntegrationsPagePath,
              },
              {
                children: integration.text,
                href: `${settingsIntegrationsPagePath}/${databaseKey}`,
              },
              { children: connectionName },
            ]}
          />
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            onCancel={() =>
              navigate(`${settingsIntegrationsPagePath}/${databaseKey}`)
            }
            onSave={handleSave}
          />
        </SettingsHeaderContainer>
        {hasSyncedTables && (
          <Info // update colors
            text={
              'You cannot edit this connection because it has tracked tables.\nIf you need to make changes, please create a new connection or unsync the tables first.'
            }
            accent={'blue'}
          />
        )}
        {databaseKey === 'postgresql' ? (
          <Section>
            <H2Title
              title="Edit PostgreSQL Connection"
              description="Edit the information to connect your PostgreSQL database"
            />
            <SettingsIntegrationPostgreSQLConnectionForm
              disabled={hasSyncedTables}
              passwordPlaceholder="••••••"
            />
          </Section>
        ) : null}
      </FormProvider>
    </SettingsIntegrationDatabaseConnectionWrapper>
  );
};

const getEditionSchema = (databaseKey: string) => {
  switch (databaseKey) {
    case 'postgresql':
      return z.object({
        dbname: z.string().optional(),
        host: z.string().optional(),
        port: z
          .preprocess((val) => parseInt(val as string), z.number().positive())
          .optional(),
        username: z.string().optional(),
        password: z.string().optional(),
      });
    default:
      throw new Error(`No schema found for database key: ${databaseKey}`);
  }
};

const getFormDefaultValues = ({
  databaseKey,
  connection,
}: {
  databaseKey: string;
  connection: any;
}) => {
  switch (databaseKey) {
    case 'postgresql':
      return {
        dbname: connection?.foreignDataWrapperOptions.dbname,
        host: connection?.foreignDataWrapperOptions.host,
        port: connection?.foreignDataWrapperOptions.port,
        username: connection?.userMappingOptions?.username,
        password: '',
      };
    default:
      throw new Error(
        `No default form values for database key: ${databaseKey}`,
      );
  }
};

const formatValues = ({
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
            username: formValues.username,
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
      };

      return pickBy(formattedValues, (obj) => !isEmpty(obj));
    }
    default:
      throw new Error(`Cannot format values for database key: ${databaseKey}`);
  }
};
