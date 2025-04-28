import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Form, useParams } from 'react-router-dom';

import { ConfigVariableActionButtons } from '@/settings/admin-panel/config-variables/components/ConfigVariableActionButtons';
import { ConfigVariableHelpTextEffect } from '@/settings/admin-panel/config-variables/components/ConfigVariableHelpText';
import { ConfigVariableTitle } from '@/settings/admin-panel/config-variables/components/ConfigVariableTitle';
import { ConfigVariableValue } from '@/settings/admin-panel/config-variables/components/ConfigVariableValue';
import { useConfigVariableActions } from '@/settings/admin-panel/config-variables/hooks/useConfigVariableActions';
import { useConfigVariableForm } from '@/settings/admin-panel/config-variables/hooks/useConfigVariableForm';
import { ConfigVariableWithTypes } from '@/settings/admin-panel/config-variables/types/ConfigVariableWithTypes';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsPath } from '@/types/SettingsPath';
import { TextArea } from '@/ui/input/components/TextArea';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { isDefined } from 'twenty-shared/utils';
import {
  ConfigSource,
  useGetDatabaseConfigVariableQuery,
} from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledForm = styled(Form)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

export const SettingsAdminConfigVariableDetails = () => {
  const { variableName } = useParams();
  const { t } = useLingui();

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
          <ConfigVariableValue
            variable={variable}
            value={watch('value')}
            onChange={(value) => setValue('value', value)}
            disabled={isEnvOnly}
          />

          <TextArea
            value={variable.description}
            disabled
            minRows={4}
            label={t`Description`}
          />

          <ConfigVariableHelpTextEffect
            variable={variable}
            hasValueChanged={hasValueChanged}
          />
        </StyledForm>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
