import { type ConfigVariable } from '~/generated-admin/graphql';
import { ConfigVariableTable } from '@/settings/config-variables/components/ConfigVariableTable';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';

type SettingsAdminConfigVariablesTableProps = {
  variables: ConfigVariable[];
};

export const SettingsAdminConfigVariablesTable = ({
  variables,
}: SettingsAdminConfigVariablesTableProps) => {
  const configVariables = variables.map((variable) => ({
    name: variable.name,
    description: variable.description,
    value:
      variable.value === ''
        ? 'null'
        : variable.isSensitive
          ? '••••••'
          : typeof variable.value === 'boolean'
            ? variable.value
              ? 'true'
              : 'false'
            : typeof variable.value === 'object' && variable.value !== null
              ? JSON.stringify(variable.value)
              : variable.value,
    to: getSettingsPath(SettingsPath.AdminPanelConfigVariableDetails, {
      variableName: variable.name,
    }),
  }));

  return <ConfigVariableTable configVariables={configVariables} />;
};
