import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
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
import { useRecoilValue } from 'recoil';
import { SettingsPath, type ConfigVariableValue } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H3Title, IconCheck, IconPencil, IconX } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import {
  ConfigSource,
  useGetDatabaseConfigVariableQuery,
} from '~/generated-metadata/graphql';

const StyledForm = styled(Form)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

const StyledH3Title = styled(H3Title)`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing(2)};
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
  const isConfigVariablesInDbEnabled = useRecoilValue(
    isConfigVariablesInDbEnabledState,
  );

  const { data: configVariableData, loading } =
    useGetDatabaseConfigVariableQuery({
      variables: { key: variableName ?? '' },
      fetchPolicy: 'network-only',
    });

  const variable = configVariableData?.getDatabaseConfigVariable;

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
    setIsEditing(true);
  };

  const handleXButtonClick = () => {
    if (isFromDatabase && hasValueChanged) {
      setValue('value', variable.value);
      setIsEditing(false);
      return;
    }

    if (isFromDatabase && !hasValueChanged) {
      openModal(RESET_VARIABLE_MODAL_ID);
      return;
    }

    setValue('value', variable.value);
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
          <StyledH3Title
            title={variable.name}
            description={variable.description}
          />

          <StyledForm onSubmit={handleSubmit(onSubmit)}>
            <StyledRow>
              <ConfigVariableValueInput
                variable={variable}
                value={watch('value')}
                onChange={(value) => setValue('value', value)}
                disabled={isEnvOnly || !isEditing}
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
                    disabled={isSubmitting || !isValueValid || !hasValueChanged}
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
          </StyledForm>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>

      <ConfirmationModal
        modalId={RESET_VARIABLE_MODAL_ID}
        title={t`Reset variable`}
        subtitle={t`This will revert the database value to environment/default value. The database override will be removed and the system will use the environment settings.`}
        onConfirmClick={handleConfirmReset}
        confirmButtonText={t`Reset`}
        confirmButtonAccent="danger"
      />
    </>
  );
};
