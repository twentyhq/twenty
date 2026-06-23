import { isDefined } from 'twenty-shared/utils';

import { type Application } from '~/generated-metadata/graphql';
import { useUpdateOneApplicationVariable } from '~/pages/settings/applications/hooks/useUpdateOneApplicationVariable';
import { SettingsApplicationConnectionsSection } from '~/pages/settings/applications/tabs/SettingsApplicationConnectionsSection';
import { SettingsApplicationDetailEnvironmentVariablesTable } from '~/pages/settings/applications/tabs/SettingsApplicationDetailEnvironmentVariablesTable';
import { SettingsApplicationFunctionDomainSection } from '~/pages/settings/applications/tabs/SettingsApplicationFunctionDomainSection';

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

  const hasHttpTriggeredFunctions = (application?.logicFunctions ?? []).some(
    (logicFunction) => isDefined(logicFunction.httpRouteTriggerSettings),
  );

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
