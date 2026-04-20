import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { isConfigVariablesInDbEnabledState } from '@/client-config/states/isConfigVariablesInDbEnabledState';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { ConfigVariableHelpText } from '@/settings/admin-panel/config-variables/components/ConfigVariableHelpText';
import { ConfigVariableValueInput } from '@/settings/admin-panel/config-variables/components/ConfigVariableValueInput';
import { useConfigVariableActions } from '@/settings/admin-panel/config-variables/hooks/useConfigVariableActions';
import { ConfigVariableEdit } from '@/settings/config-variables/components/ConfigVariableEdit';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsPath, type ConfigVariableValue } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { useQuery } from '@apollo/client/react';
import {
  ConfigSource,
  GetDatabaseConfigVariableDocument,
} from '~/generated-admin/graphql';

const hasMeaningfulValue = (value: ConfigVariableValue): boolean => {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim() !== '';
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
};

export const SettingsAdminConfigVariableDetails = () => {
  const { variableName } = useParams();
  const apolloAdminClient = useApolloAdminClient();

  const { t } = useLingui();

  const [isEditing, setIsEditing] = useState(false);

  const isConfigVariablesInDbEnabled = useAtomStateValue(
    isConfigVariablesInDbEnabledState,
  );

  const { data: configVariableData, loading } = useQuery(
    GetDatabaseConfigVariableDocument,
    {
      client: apolloAdminClient,
      variables: { key: variableName ?? '' },
      fetchPolicy: 'network-only',
    },
  );

  const variable = configVariableData?.getDatabaseConfigVariable;

  const { handleUpdateVariable, handleDeleteVariable } =
    useConfigVariableActions(variable?.name ?? '');

  const [value, setValue] = useState<ConfigVariableValue>(
    variable?.value ?? null,
  );

  if (loading === true || isDefined(variable) === false) {
    return <SettingsSkeletonLoader />;
  }

  const isEnvOnly = variable.isEnvOnly;

  const isFromDatabase = variable.source === ConfigSource.DATABASE;

  const hasValueChanged =
    JSON.stringify(value) !== JSON.stringify(variable.value);

  const isValueValid =
    !isEnvOnly && hasValueChanged && hasMeaningfulValue(value);

  const onSave = async () => {
    await handleUpdateVariable(value, isFromDatabase);
  };

  const onEdit = () => {
    if (variable.isSensitive) {
      setValue('');
    }
  };

  const canOpenCancelModal = isFromDatabase && !hasValueChanged;

  const onCancel = () => {
    setValue(variable.value);
  };

  const onConfirmReset = async () => {
    await handleDeleteVariable();
  };

  return (
    <SubMenuTopBarContainer
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Admin Panel - Config`,
          href: getSettingsPath(
            SettingsPath.AdminPanel,
            undefined,
            undefined,
            'config-variables',
          ),
        },
        {
          children: variable.name,
        },
      ]}
    >
      <ConfigVariableEdit
        title={variable.name}
        description={variable.description}
        input={
          <ConfigVariableValueInput
            variable={variable}
            value={value}
            onChange={setValue}
            disabled={isEnvOnly || !isEditing}
          />
        }
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        isSaveDisabled={!isValueValid}
        onSave={onSave}
        onCancel={onCancel}
        canOpenCancelModal={canOpenCancelModal}
        onEdit={onEdit}
        onConfirmReset={onConfirmReset}
        editDisabled={isEnvOnly || !isConfigVariablesInDbEnabled}
        helpContent={
          <ConfigVariableHelpText
            variable={variable}
            hasValueChanged={hasValueChanged}
          />
        }
      />
    </SubMenuTopBarContainer>
  );
};
