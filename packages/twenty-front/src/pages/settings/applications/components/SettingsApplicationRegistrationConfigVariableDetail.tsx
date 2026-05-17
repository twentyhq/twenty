import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import {
  FindApplicationRegistrationVariablesDocument,
  FindOneApplicationRegistrationDocument,
  UpdateApplicationRegistrationVariableDocument,
} from '~/generated-metadata/graphql';
import { useMutation, useQuery } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { ConfigVariableEdit } from '@/settings/config-variables/components/ConfigVariableEdit';
import { TextInput } from '@/ui/input/components/TextInput';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';

export const SettingsApplicationRegistrationConfigVariableDetail = () => {
  const { t } = useLingui();

  const { variableKey } = useParams();

  const [value, setValue] = useState<string>('');

  const [isEditing, setIsEditing] = useState(false);

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
    return <SettingsSkeletonLoader />;
  }

  const canOpenCancelModal = variable.isFilled && !isNonEmptyString(value);

  const onCancel = () => {
    setValue('');
  };

  const onSave = async () => {
    if (!isNonEmptyString(value)) {
      return;
    }

    try {
      await updateVariable({
        variables: {
          input: {
            id: variable.id,
            update: {
              value,
            },
          },
        },
      });
    } finally {
      setValue('');
    }
  };

  const onConfirmReset = async () => {
    try {
      await updateVariable({
        variables: {
          input: {
            id: variable.id,
            update: {
              value: '',
              resetValue: true,
            },
          },
        },
      });
    } finally {
      setValue('');
    }
  };

  return (
    <SubMenuTopBarContainer
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
      <ConfigVariableEdit
        title={variable.key}
        description={variable.description}
        input={
          <TextInput
            value={value}
            placeholder={
              !isEditing ? (variable.value ?? t`set-config-value`) : ''
            }
            onChange={setValue}
            disabled={!isEditing}
            fullWidth
          />
        }
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        isSaveDisabled={!isNonEmptyString(value)}
        onSave={onSave}
        onCancel={onCancel}
        canOpenCancelModal={canOpenCancelModal}
        onConfirmReset={onConfirmReset}
      />
    </SubMenuTopBarContainer>
  );
};
