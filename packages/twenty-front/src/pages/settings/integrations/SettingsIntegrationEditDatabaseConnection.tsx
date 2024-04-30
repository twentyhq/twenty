import { useContext, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { Section } from '@react-email/components';
import { pick } from 'lodash';
import { z } from 'zod';

import { useUpdateOneDatabaseConnection } from '@/databases/hooks/useUpdateOneDatabaseConnection';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsIntegrationPostgreSQLConnectionForm } from '@/settings/integrations/components/SettingsIntegrationDatabaseConnectionForm';
import { SettingsIntegrationDatabaseConnectionWrapper } from '@/settings/integrations/components/wrappers/SettingsIntegrationDatabaseConnectionWrapper';
import { DatabaseConnectionContext } from '@/settings/integrations/contexts/DatabaseConnectionContext';
import { SettingsIntegration } from '@/settings/integrations/types/SettingsIntegration';
import {
  formatValuesForUpdate,
  getEditionSchemaForForm,
  getFormDefaultValuesFromConnection,
} from '@/settings/integrations/utils/editDatabaseConnection';
import { getConnectionDbName } from '@/settings/integrations/utils/getConnectionDbName';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Info } from '@/ui/display/info/components/Info';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import {
  RemoteServer,
  RemoteTable,
  RemoteTableStatus,
} from '~/generated-metadata/graphql';

export const SettingsIntegrationEditDatabaseConnection = () => {
  const { enqueueSnackBar } = useSnackBar();
  const navigate = useNavigate();

  const { integration, connection, databaseKey, tables } = useContext(
    DatabaseConnectionContext,
  ) as {
    integration: SettingsIntegration;
    connection: RemoteServer;
    databaseKey: string;
    tables: RemoteTable[] | undefined;
  };

  const settingsIntegrationsPagePath = getSettingsPagePath(
    SettingsPath.Integrations,
  );

  const hasSyncedTables = tables?.some(
    (table) => table?.status === RemoteTableStatus.Synced,
  );

  const editConnectionSchema = getEditionSchemaForForm(databaseKey);
  type SettingsIntegrationEditConnectionFormValues = z.infer<
    typeof editConnectionSchema
  >;

  const formConfig = useForm<SettingsIntegrationEditConnectionFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(editConnectionSchema),
    defaultValues: useMemo(() => {
      return getFormDefaultValuesFromConnection({ databaseKey, connection });
    }, [databaseKey, connection]),
  });

  const { updateOneDatabaseConnection } = useUpdateOneDatabaseConnection();

  const connectionName = getConnectionDbName({ integration, connection });

  const canSave =
    formConfig.formState.isDirty &&
    formConfig.formState.isValid &&
    !hasSyncedTables;

  const handleSave = async () => {
    const formValues = formConfig.getValues();
    const dirtyFieldKeys = Object.keys(
      formConfig.formState.dirtyFields,
    ) as (keyof SettingsIntegrationEditConnectionFormValues)[];

    try {
      await updateOneDatabaseConnection({
        ...formatValuesForUpdate({
          databaseKey,
          formValues: pick(formValues, dirtyFieldKeys),
        }),
        id: connection.id,
      });

      navigate(
        `${settingsIntegrationsPagePath}/${databaseKey}/${connection.id}`,
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
