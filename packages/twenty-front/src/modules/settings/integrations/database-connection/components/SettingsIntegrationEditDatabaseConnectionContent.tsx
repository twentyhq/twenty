import { zodResolver } from '@hookform/resolvers/zod';
import { Section } from '@react-email/components';
import pick from 'lodash.pick';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { H2Title } from 'twenty-ui';
import { z } from 'zod';

import { useUpdateOneDatabaseConnection } from '@/databases/hooks/useUpdateOneDatabaseConnection';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsIntegrationDatabaseConnectionForm } from '@/settings/integrations/database-connection/components/SettingsIntegrationDatabaseConnectionForm';
import {
  formatValuesForUpdate,
  getEditionSchemaForForm,
  getFormDefaultValuesFromConnection,
} from '@/settings/integrations/database-connection/utils/editDatabaseConnection';
import { SettingsIntegration } from '@/settings/integrations/types/SettingsIntegration';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Info } from '@/ui/display/info/components/Info';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import {
  RemoteServer,
  RemoteTable,
  RemoteTableStatus,
} from '~/generated-metadata/graphql';

export const SettingsIntegrationEditDatabaseConnectionContent = ({
  connection,
  integration,
  databaseKey,
  tables,
}: {
  connection: RemoteServer;
  integration: SettingsIntegration;
  databaseKey: string;
  tables: RemoteTable[];
}) => {
  const { enqueueSnackBar } = useSnackBar();
  const navigate = useNavigate();

  const editConnectionSchema = getEditionSchemaForForm(databaseKey);
  type SettingsIntegrationEditConnectionFormValues = z.infer<
    typeof editConnectionSchema
  >;

  const formConfig = useForm<SettingsIntegrationEditConnectionFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(editConnectionSchema),
    defaultValues: getFormDefaultValuesFromConnection({
      databaseKey,
      connection,
    }),
  });

  const { updateOneDatabaseConnection } = useUpdateOneDatabaseConnection();

  const settingsIntegrationsPagePath = getSettingsPagePath(
    SettingsPath.Integrations,
  );

  const hasSyncedTables = tables?.some(
    (table) => table?.status === RemoteTableStatus.Synced,
  );

  const { isDirty, isValid } = formConfig.formState;
  const canSave = isDirty && isValid && !hasSyncedTables; // order matters here

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
        variant: SnackBarVariant.Error,
      });
    }
  };

  // TODO: move breadcrumb to header?
  return (
    <>
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
              { children: connection.label },
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
          <Info
            text={
              'You cannot edit this connection because it has tracked tables.\nIf you need to make changes, please create a new connection or unsync the tables first.'
            }
            accent={'blue'}
          />
        )}
        <Section>
          <H2Title
            title="Edit Connection"
            description="Edit the information to connect your database"
          />

          <SettingsIntegrationDatabaseConnectionForm
            databaseKey={databaseKey}
            disabled={hasSyncedTables}
          />
        </Section>
      </FormProvider>
    </>
  );
};
