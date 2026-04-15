import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import {
  FindApplicationRegistrationVariablesDocument,
  FindOneApplicationRegistrationDocument,
  UpdateApplicationRegistrationVariableDocument,
} from '~/generated-metadata/graphql';
import { useMutation, useQuery } from '@apollo/client/react';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { isNonEmptyString } from '@sniptt/guards';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { Tag } from 'twenty-ui/components';
import { styled } from '@linaria/react';
import { H3Title, IconCheck, IconX } from 'twenty-ui/display';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Button } from 'twenty-ui/input';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { TextInput } from '@/ui/input/components/TextInput';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SettingsApplicationRegistrationConfigVariableStatus } from '~/pages/settings/applications/components/SettingsApplicationRegistrationConfigVariableStatus';
import { Section } from 'twenty-ui/layout';

const RESET_VARIABLE_MODAL_ID =
  'reset-application-registration-config-variable-modal';

const StyledRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledButtonContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 200px;
`;

export const SettingsApplicationRegistrationConfigVariableDetail = () => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const { variableKey } = useParams();
  const [value, setValue] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { openModal } = useModal();

  const { applicationRegistrationId = '' } = useParams<{
    applicationRegistrationId: string;
  }>();

  const { data: applicationRegistrationData } = useQuery(
    FindOneApplicationRegistrationDocument,
    {
      variables: { id: applicationRegistrationId },
      skip: !applicationRegistrationId,
    },
  );

  const registration =
    applicationRegistrationData?.findOneApplicationRegistration;

  const { data: variablesData } = useQuery(
    FindApplicationRegistrationVariablesDocument,
    {
      variables: { applicationRegistrationId },
      skip: !applicationRegistrationId,
    },
  );

  const variable = (
    variablesData?.findApplicationRegistrationVariables ?? []
  ).find((variable) => variable.key === variableKey);

  const [updateVariable] = useMutation(
    UpdateApplicationRegistrationVariableDocument,
    {
      refetchQueries: [FindApplicationRegistrationVariablesDocument],
    },
  );

  if (!variable || !registration) {
    return null;
  }

  const handleXButtonClick = () => {
    if (!isEditing) {
      openModal(RESET_VARIABLE_MODAL_ID);
      return;
    }

    setValue('');
    setIsEditing(false);
  };

  const handleSaveVariableValue = async ({
    resetValue,
  }: {
    resetValue?: boolean;
  }) => {
    const variableKey = variable.key;

    if (!isNonEmptyString(value) && !resetValue) {
      return;
    }

    try {
      setIsSubmitting(true);
      await updateVariable({
        variables: {
          input: {
            id: variable.id,
            update: {
              value,
              resetValue,
            },
          },
        },
      });
      enqueueSuccessSnackBar({
        message: t`Variable ${variableKey} updated`,
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Error updating variable`,
      });
    } finally {
      setIsSubmitting(false);
      setValue('');
      setIsEditing(false);
    }
  };

  const handleConfirmReset = async () => {
    await handleSaveVariableValue({ resetValue: true });
  };

  return (
    <SubMenuTopBarContainer
      title={registration.name}
      tag={<Tag text={t`Owner`} color={'gray'} />}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: t`Applications - Developer`,
          href: getSettingsPath(
            SettingsPath.Applications,
            undefined,
            undefined,
            'developer',
          ),
        },
        {
          children: t`${registration.name} - Config`,
          href: getSettingsPath(
            SettingsPath.ApplicationRegistrationDetail,
            { applicationRegistrationId },
            undefined,
            'config',
          ),
        },
        {
          children: variableKey,
        },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H3Title
            title={
              <>
                {variable.key}
                {variable.isRequired && (
                  <span style={{ color: 'red' }}> *</span>
                )}
              </>
            }
            description={variable.description}
          />
        </Section>

        <Section>
          <StyledRow>
            <TextInput
              value={value}
              placeholder={
                variable.isFilled
                  ? '••••••••••••••••••••••••'
                  : t`set-config-value`
              }
              onChange={(value) => {
                setValue(value);
                setIsEditing(true);
              }}
              fullWidth
            />

            <StyledButtonContainer>
              <Button
                Icon={IconCheck}
                variant="secondary"
                onClick={() => handleSaveVariableValue({ resetValue: false })}
                disabled={isSubmitting || !isEditing}
              />
              <Button
                Icon={IconX}
                variant="secondary"
                onClick={handleXButtonClick}
                type="button"
                disabled={isSubmitting || (!isEditing && !variable.isFilled)}
              />
              <SettingsApplicationRegistrationConfigVariableStatus
                variable={variable}
              />
            </StyledButtonContainer>
          </StyledRow>
        </Section>
      </SettingsPageContainer>

      <ConfirmationModal
        modalInstanceId={RESET_VARIABLE_MODAL_ID}
        title={t`Reset variable`}
        subtitle={t`Are you sure you want to reset this variable?`}
        onConfirmClick={handleConfirmReset}
        confirmButtonText={t`Reset`}
        confirmButtonAccent="danger"
      />
    </SubMenuTopBarContainer>
  );
};
