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
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { zodResolver } from '@hookform/resolvers/zod';
import { Section } from '@react-email/components';
import pick from 'lodash.pick';
import { FormProvider, useForm } from 'react-hook-form';
import { H2Title, Info } from 'twenty-ui';
import { z } from 'zod';
import {
  RemoteServer,
  RemoteTable,
  RemoteTableStatus,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

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
  const navigate = useNavigateSettings();

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

  const settingsIntegrationsPagePath = getSettingsPath(
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

      navigate(SettingsPath.IntegrationDatabaseConnection, {
        databaseKey,
        connectionId: connection?.id,
      });
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
              navigate(SettingsPath.IntegrationDatabase, {
                databaseKey,
              })
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
