import { type Application } from '~/generated-metadata/graphql';
import { useUpdateOneApplicationVariable } from '~/pages/settings/applications/hooks/useUpdateOneApplicationVariable';
import { SettingsApplicationConnectionsSection } from '~/pages/settings/applications/tabs/SettingsApplicationConnectionsSection';
import { SettingsApplicationDetailEnvironmentVariablesTable } from '~/pages/settings/applications/tabs/SettingsApplicationDetailEnvironmentVariablesTable';
import { SettingsApplicationFunctionDomainSection } from '~/pages/settings/applications/tabs/SettingsApplicationFunctionDomainSection';
import { applicationHasHttpTriggeredFunctions } from '~/pages/settings/applications/utils/applicationHasHttpTriggeredFunctions';

export const SettingsApplicationDetailSettingsTab = ({
  application,
}: {
  application?: Pick<
    Application,
    | 'applicationVariables'
    | 'id'
    | 'universalIdentifier'
    | 'canBeUninstalled'
    | 'logicFunctions'
  >;
}) => {
  const { updateOneApplicationVariable } = useUpdateOneApplicationVariable();

  const envVariables = [...(application?.applicationVariables ?? [])].sort(
    (a, b) => a.key.localeCompare(b.key),
  );

  const hasHttpTriggeredFunctions =
    applicationHasHttpTriggeredFunctions(application);

  return (
    <>
      {hasHttpTriggeredFunctions && (
        <SettingsApplicationFunctionDomainSection />
      )}
      {application?.id && (
        <SettingsApplicationConnectionsSection applicationId={application.id} />
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
