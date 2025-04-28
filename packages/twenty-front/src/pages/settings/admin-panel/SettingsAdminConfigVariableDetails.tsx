import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Form, useParams } from 'react-router-dom';

import { isConfigVariablesInDbEnabledState } from '@/client-config/states/isConfigVariablesInDbEnabledState';

import { ConfigVariableActionButtons } from '@/settings/admin-panel/config-variables/components/ConfigVariableActionButtons';
import { ConfigVariableCurrentValue } from '@/settings/admin-panel/config-variables/components/ConfigVariableCurrentValue';
import { ConfigVariableEditValue } from '@/settings/admin-panel/config-variables/components/ConfigVariableEditValue';
import { ConfigVariableHelpTextEffect } from '@/settings/admin-panel/config-variables/components/ConfigVariableHelpText';
import { ConfigVariableTitle } from '@/settings/admin-panel/config-variables/components/ConfigVariableTitle';
import { useConfigVariableActions } from '@/settings/admin-panel/config-variables/hooks/useConfigVariableActions';
import { useConfigVariableForm } from '@/settings/admin-panel/config-variables/hooks/useConfigVariableForm';
import { ConfigVariableWithTypes } from '@/settings/admin-panel/config-variables/types/ConfigVariableWithTypes';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  ConfigSource,
  useGetDatabaseConfigVariableQuery,
} from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledForm = styled(Form)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  width: 100%;
`;

const StyledInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export const SettingsAdminConfigVariableDetails = () => {
  const { variableName } = useParams();
  const { t } = useLingui();

  const isConfigVariablesInDbEnabled = useRecoilValue(
    isConfigVariablesInDbEnabledState,
  );

  const { data: configVariableData, loading } =
    useGetDatabaseConfigVariableQuery({
      variables: { key: variableName ?? '' },
      fetchPolicy: 'network-only',
    });

  const variable =
    configVariableData?.getDatabaseConfigVariable as ConfigVariableWithTypes;

  const { handleUpdateVariable, handleDeleteVariable } =
    useConfigVariableActions(variable?.name ?? '');

  const {
    handleSubmit,
    setValue,
    isSubmitting,
    watch,
    hasValueChanged,
    isValueValid,
  } = useConfigVariableForm(variable);

  if (loading || !isDefined(variable)) {
    return <SettingsSkeletonLoader />;
  }

  const isEnvOnly = variable.isEnvOnly;
  const isFromDatabase = variable.source === ConfigSource.DATABASE;

  const onSubmit = async (formData: {
    value: string | number | boolean | string[] | null;
  }) => {
    await handleUpdateVariable(formData.value, isFromDatabase);
  };

  return (
    <SubMenuTopBarContainer
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Admin Panel`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Config Variables`,
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
      actionButton={
        <ConfigVariableActionButtons
          variable={variable}
          isValueValid={isValueValid}
          isSubmitting={isSubmitting}
          onSave={handleSubmit(onSubmit)}
          onReset={handleDeleteVariable}
        />
      }
    >
      <SettingsPageContainer>
        <ConfigVariableTitle name={variable.name} source={variable.source} />

        <StyledForm onSubmit={handleSubmit(onSubmit)}>
          <StyledInputContainer>
            <ConfigVariableCurrentValue variable={variable} />
          </StyledInputContainer>

          <StyledInputContainer>
            {isConfigVariablesInDbEnabled && !isEnvOnly && (
              <ConfigVariableEditValue
                variable={variable}
                value={watch('value')}
                onChange={(value) => setValue('value', value)}
                disabled={isEnvOnly}
              />
            )}

            <ConfigVariableHelpTextEffect
              variable={variable}
              hasValueChanged={hasValueChanged}
            />
          </StyledInputContainer>
        </StyledForm>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
