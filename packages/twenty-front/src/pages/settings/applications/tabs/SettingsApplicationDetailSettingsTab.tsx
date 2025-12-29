import { isDefined } from 'twenty-shared/utils';
import type { Application } from '~/generated/graphql';
import { useUpdateOneApplicationVariable } from '~/pages/settings/applications/hooks/useUpdateOneApplicationVariable';
import { SettingsApplicationDetailEnvironmentVariablesTable } from '~/pages/settings/applications/tabs/SettingsApplicationDetailEnvironmentVariablesTable';

export const SettingsApplicationDetailSettingsTab = ({
  application,
}: {
  application?: Omit<Application, 'objects'> & {
    objects: { id: string }[];
  };
}) => {
  const { updateOneApplicationVariable } = useUpdateOneApplicationVariable();

  if (!isDefined(application)) {
    return null;
  }

  const envVariables = [...(application.applicationVariables ?? [])].sort(
    (a, b) => a.key.localeCompare(b.key),
  );

  return (
    <>
      <SettingsApplicationDetailEnvironmentVariablesTable
        envVariables={envVariables}
        onUpdate={({ key, value }) =>
          updateOneApplicationVariable({
            key,
            value,
            applicationId: application.id,
          })
        }
      />
    </>
  );
};
