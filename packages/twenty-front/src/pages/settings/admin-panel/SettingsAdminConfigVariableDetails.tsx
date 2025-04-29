import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Form, useParams } from 'react-router-dom';

import { ConfigVariableHelpText } from '@/settings/admin-panel/config-variables/components/ConfigVariableHelpText';
import { ConfigVariableTitle } from '@/settings/admin-panel/config-variables/components/ConfigVariableTitle';
import { ConfigVariableValue } from '@/settings/admin-panel/config-variables/components/ConfigVariableValue';
import { useConfigVariableActions } from '@/settings/admin-panel/config-variables/hooks/useConfigVariableActions';
import { useConfigVariableForm } from '@/settings/admin-panel/config-variables/hooks/useConfigVariableForm';
import { ConfigVariableWithTypes } from '@/settings/admin-panel/config-variables/types/ConfigVariableWithTypes';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsPath } from '@/types/SettingsPath';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { isDefined } from 'twenty-shared/utils';
import { IconDeviceFloppy, IconPencil, IconX } from 'twenty-ui/display';
import { Button, ButtonGroup } from 'twenty-ui/input';
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

const StyledRow = styled.div`
  display: flex;
  align-items: bottom;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledValueContainer = styled.div`
  flex: 1;
`;

const StyledButtonGroup = styled(ButtonGroup)`
  & > :not(:first-of-type) > button {
    border-left: none;
  }
`;

export const SettingsAdminConfigVariableDetails = () => {
  const { variableName } = useParams();
  const { t } = useLingui();
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

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

  if (loading === true || isDefined(variable) === false) {
    return <SettingsSkeletonLoader />;
  }

  const isEnvOnly = variable.isEnvOnly;
  const isFromDatabase = variable.source === ConfigSource.DATABASE;

  const onSubmit = async (formData: {
    value: string | number | boolean | string[] | null;
  }) => {
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
      setIsConfirmationModalOpen(true);
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
          <ConfigVariableTitle
            name={variable.name}
            description={variable.description}
          />

          <StyledForm onSubmit={handleSubmit(onSubmit)}>
            <StyledRow>
              <StyledValueContainer>
                <ConfigVariableValue
                  variable={variable}
                  value={watch('value')}
                  onChange={(value) => setValue('value', value)}
                  disabled={isEnvOnly || !isEditing}
                />
              </StyledValueContainer>

              {!isEditing ? (
                <Button
                  Icon={IconPencil}
                  variant="primary"
                  onClick={handleEditClick}
                  type="button"
                  disabled={isEnvOnly}
                />
              ) : (
                <StyledButtonGroup>
                  <Button
                    Icon={IconDeviceFloppy}
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting || !isValueValid || !hasValueChanged}
                  />
                  <Button
                    Icon={IconX}
                    variant="primary"
                    accent={
                      isFromDatabase && !hasValueChanged ? 'danger' : undefined
                    }
                    onClick={handleXButtonClick}
                    type="button"
                    disabled={isSubmitting}
                  />
                </StyledButtonGroup>
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
        isOpen={isConfirmationModalOpen}
        setIsOpen={(isOpen) => {
          setIsConfirmationModalOpen(isOpen);
          if (!isOpen) {
            setIsEditing(false);
          }
        }}
        title={t`Reset variable`}
        subtitle={t`This will revert the database value to environment/default value. The database override will be removed and the system will use the environment settings.`}
        onConfirmClick={handleConfirmReset}
        confirmButtonText={t`Reset`}
        confirmButtonAccent="danger"
      />
    </>
  );
};
