import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';
import {
  FindAdminApplicationRegistrationVariablesDocument,
  FindOneAdminApplicationRegistrationDocument,
  UpdateAdminApplicationRegistrationVariableDocument,
} from '~/generated-admin/graphql';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { APPLICATION_REGISTRATION_ADMIN_PATH } from '@/settings/admin-panel/apps/constants/ApplicationRegistrationAdminPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { ConfigVariableEdit } from '@/settings/config-variables/components/ConfigVariableEdit';
import { TextInput } from '@/ui/input/components/TextInput';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';

export const SettingsAdminApplicationRegistrationConfigVariableDetail = () => {
  const { t } = useLingui();
  const apolloAdminClient = useApolloAdminClient();

  const { variableKey } = useParams();

  const [value, setValue] = useState<string>('');

  const [isEditing, setIsEditing] = useState(false);

  const { applicationRegistrationId = '' } = useParams<{
    applicationRegistrationId: string;
  }>();

  const { data: applicationRegistrationData } = useQuery(
    FindOneAdminApplicationRegistrationDocument,
    {
      client: apolloAdminClient,
      variables: { id: applicationRegistrationId },
      skip: !applicationRegistrationId,
    },
  );

  const registration =
    applicationRegistrationData?.findOneAdminApplicationRegistration;

  const { data: variablesData } = useQuery(
    FindAdminApplicationRegistrationVariablesDocument,
    {
      client: apolloAdminClient,
      variables: { applicationRegistrationId },
      skip: !applicationRegistrationId,
    },
  );

  const variable = (
    variablesData?.findAdminApplicationRegistrationVariables ?? []
  ).find((variable) => variable.key === variableKey);

  const [updateVariable] = useMutation(
    UpdateAdminApplicationRegistrationVariableDocument,
    {
      client: apolloAdminClient,
      refetchQueries: [FindAdminApplicationRegistrationVariablesDocument],
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
          children: t`Other`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Admin Panel - Apps`,
          href: APPLICATION_REGISTRATION_ADMIN_PATH,
        },
        {
          children: t`${registration.name} - Config`,
          href: getSettingsPath(
            SettingsPath.AdminPanelApplicationRegistrationDetail,
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
