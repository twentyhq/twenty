import { type Application } from '~/generated-metadata/graphql';
import { useUpdateOneApplicationVariable } from '~/pages/settings/applications/hooks/useUpdateOneApplicationVariable';
import { SettingsApplicationDetailEnvironmentVariablesTable } from '~/pages/settings/applications/tabs/SettingsApplicationDetailEnvironmentVariablesTable';
import { SettingsApplicationOAuthProvidersSection } from '~/pages/settings/applications/tabs/SettingsApplicationOAuthProvidersSection';

export const SettingsApplicationDetailSettingsTab = ({
  application,
}: {
  application?: Pick<
    Application,
    'applicationVariables' | 'id' | 'universalIdentifier' | 'canBeUninstalled'
  >;
}) => {
  const { updateOneApplicationVariable } = useUpdateOneApplicationVariable();

  const envVariables = [...(application?.applicationVariables ?? [])].sort(
    (a, b) => a.key.localeCompare(b.key),
  );

  return (
    <>
      {application?.id && (
        <SettingsApplicationOAuthProvidersSection
          applicationId={application.id}
        />
      )}
      <SettingsApplicationDetailEnvironmentVariablesTable
        envVariables={envVariables}
        onUpdate={({ key, value }) =>
          application?.id
            ? updateOneApplicationVariable({
                key,
                value,
                applicationId: application.id,
              })
            : null
        }
      />
    </>
  );
};
