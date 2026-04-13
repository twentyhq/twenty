import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Form, useParams } from 'react-router-dom';

import { isConfigVariablesInDbEnabledState } from '@/client-config/states/isConfigVariablesInDbEnabledState';
import { ConfigVariableHelpText } from '@/settings/admin-panel/config-variables/components/ConfigVariableHelpText';
import { ConfigVariableValueInput } from '@/settings/admin-panel/config-variables/components/ConfigVariableValueInput';
import { useConfigVariableActions } from '@/settings/admin-panel/config-variables/hooks/useConfigVariableActions';
import { useConfigVariableForm } from '@/settings/admin-panel/config-variables/hooks/useConfigVariableForm';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsPath, type ConfigVariableValue } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H3Title, IconCheck, IconPencil, IconX } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useQuery } from '@apollo/client/react';
import {
  ConfigSource,
  GetDatabaseConfigVariableDocument,
} from '~/generated-metadata/graphql';

const StyledFormContainer = styled.div`
  > form {
    display: flex;
    flex-direction: column;
    gap: ${themeCssVariables.spacing[4]};
    width: 100%;
  }
`;

const StyledH3TitleContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledRow = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  & > :not(:first-of-type) > button {
    border-left: none;
  }
`;

const RESET_VARIABLE_MODAL_ID = 'reset-variable-modal';

export const SettingsAdminConfigVariableDetails = () => {
  const { variableName } = useParams();
  const { t } = useLingui();
  const [isEditing, setIsEditing] = useState(false);
  const { openModal } = useModal();
  const isConfigVariablesInDbEnabled = useAtomStateValue(
    isConfigVariablesInDbEnabledState,
  );

  const { data: configVariableData, loading } = useQuery(
    GetDatabaseConfigVariableDocument,
    {
      variables: { key: variableName ?? '' },
      fetchPolicy: 'network-only',
    },
  );

  const variable = configVariableData?.getDatabaseConfigVariable;

  const { handleUpdateVariable, handleDeleteVariable } =
    useConfigVariableActions(variable?.name ?? '');

  const {
    control,
    handleSubmit,
    reset,
    isSubmitting,
    hasValueChanged,
    isValueValid,
  } = useConfigVariableForm(variable);

  if (loading === true || isDefined(variable) === false) {
    return <SettingsSkeletonLoader />;
  }

  const isEnvOnly = variable.isEnvOnly;
  const isFromDatabase = variable.source === ConfigSource.DATABASE;

  const onSubmit = async (formData: { value: ConfigVariableValue }) => {
    await handleUpdateVariable(formData.value, isFromDatabase);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    if (variable.isSensitive) {
      reset({ value: '' });
    }
    setIsEditing(true);
  };

  const handleXButtonClick = () => {
    if (isFromDatabase && !hasValueChanged) {
      openModal(RESET_VARIABLE_MODAL_ID);
      return;
    }

    reset({ value: variable.value });
    setIsEditing(false);
  };

  const handleConfirmReset = () => {
    handleDeleteVariable();
    setIsEditing(false);
  };

  return (
    <>
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
      >
        <SettingsPageContainer>
          <StyledH3TitleContainer>
            <H3Title title={variable.name} description={variable.description} />
          </StyledH3TitleContainer>

          <StyledFormContainer>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <StyledRow>
                <Controller
                  control={control}
                  name="value"
                  render={({ field }) => (
                    <ConfigVariableValueInput
                      variable={variable}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isEnvOnly || !isEditing}
                    />
                  )}
                />

                {!isEditing ? (
                  <Button
                    Icon={IconPencil}
                    variant="primary"
                    onClick={handleEditClick}
                    type="button"
                    disabled={isEnvOnly || !isConfigVariablesInDbEnabled}
                  />
                ) : (
                  <StyledButtonContainer>
                    <Button
                      Icon={IconCheck}
                      variant="secondary"
                      position="left"
                      type="submit"
                      disabled={isSubmitting || !isValueValid}
                    />
                    <Button
                      Icon={IconX}
                      variant="secondary"
                      position="right"
                      onClick={handleXButtonClick}
                      type="button"
                      disabled={isSubmitting}
                    />
                  </StyledButtonContainer>
                )}
              </StyledRow>

              <ConfigVariableHelpText
                variable={variable}
                hasValueChanged={hasValueChanged}
              />
            </Form>
          </StyledFormContainer>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>

      <ConfirmationModal
        modalInstanceId={RESET_VARIABLE_MODAL_ID}
        title={t`Reset variable`}
        subtitle={t`This will revert the database value to environment/default value. The database override will be removed and the system will use the environment settings.`}
        onConfirmClick={handleConfirmReset}
        confirmButtonText={t`Reset`}
        confirmButtonAccent="danger"
      />
    </>
  );
};
