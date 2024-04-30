import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { Section } from '@react-email/components';
import pick from 'lodash.pick';
import { z } from 'zod';

import { useUpdateOneDatabaseConnection } from '@/databases/hooks/useUpdateOneDatabaseConnection';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsIntegrationPostgreSQLConnectionForm } from '@/settings/integrations/components/SettingsIntegrationDatabaseConnectionForm';
import { SettingsIntegrationPostgreSQLConnectionFormEffect } from '@/settings/integrations/components/SettingsIntegrationPostgreSQLConnectionFormEffect';
import { useDatabaseConnection } from '@/settings/integrations/hooks/useDatabaseConnection';
import {
  formatValuesForUpdate,
  getEditionSchemaForForm,
} from '@/settings/integrations/utils/editDatabaseConnection';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Info } from '@/ui/display/info/components/Info';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { RemoteTableStatus } from '~/generated-metadata/graphql';

export const SettingsIntegrationEditDatabaseConnectionContainer = ({
  connection,
  integration,
  databaseKey,
  tables,
}) => {
  const { enqueueSnackBar } = useSnackBar();
  const navigate = useNavigate();

  const { connection, integration, databaseKey, tables } =
    useDatabaseConnection();

  const editConnectionSchema = getEditionSchemaForForm(databaseKey);
  type SettingsIntegrationEditConnectionFormValues = z.infer<
    typeof editConnectionSchema
  >;

  const formConfig = useForm<SettingsIntegrationEditConnectionFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(editConnectionSchema),
  });

  const { updateOneDatabaseConnection } = useUpdateOneDatabaseConnection();

  const settingsIntegrationsPagePath = getSettingsPagePath(
    SettingsPath.Integrations,
  );

  const hasSyncedTables = tables?.some(
    (table) => table?.status === RemoteTableStatus.Synced,
  );

  const connectionName = 'toto';

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
        id: connection?.id ?? '',
      });

      navigate(
        `${settingsIntegrationsPagePath}/${databaseKey}/${connection?.id}`,
      );
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: 'error',
      });
    }
  };

  return (
    <>
      <SettingsIntegrationPostgreSQLConnectionFormEffect
        formConfig={formConfig}
        databaseKey={databaseKey}
        connection={connection}
      />
      <FormProvider
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...formConfig}
      >
        <SettingsHeaderContainer>
          {integration && (
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
          )}
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            onCancel={() =>
              navigate(`${settingsIntegrationsPagePath}/${databaseKey}`)
            }
            onSave={handleSave}
          />
        </SettingsHeaderContainer>
        {hasSyncedTables && (
          <Info
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
    </>
  );
};
