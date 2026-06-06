import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import {
  FindApplicationRegistrationVariablesDocument,
  FindOneApplicationRegistrationDocument,
  UpdateApplicationRegistrationVariableDocument,
} from '~/generated-metadata/graphql';
import { useMutation, useQuery } from '@apollo/client/react';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { NotFound } from '~/pages/not-found/NotFound';
import { ApplicationRegistrationConfigVariableEditForm } from '@/settings/application-registrations/components/ApplicationRegistrationConfigVariableEditForm';

export const SettingsApplicationRegistrationConfigVariableDetail = () => {
  const { t } = useLingui();

  const { variableKey, applicationRegistrationId = '' } = useParams<{
    applicationRegistrationId: string;
    variableKey: string;
  }>();

  const { data: applicationRegistrationData, loading: registrationLoading } =
    useQuery(FindOneApplicationRegistrationDocument, {
      variables: { id: applicationRegistrationId },
      skip: !applicationRegistrationId,
    });

  const registration =
    applicationRegistrationData?.findOneApplicationRegistration;

  const { data: variablesData, loading: variablesLoading } = useQuery(
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

  if (registrationLoading || variablesLoading) {
    return <SettingsSkeletonLoader />;
  }

  if (!variable || !registration) {
    return <NotFound />;
  }

  const onUpdateVariable = async (
    id: string,
    update: { value: string; resetValue?: boolean },
  ) => {
    await updateVariable({
      variables: { input: { id, update } },
    });
  };

  return (
    <SettingsPageLayout
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
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
      <ApplicationRegistrationConfigVariableEditForm
        variable={variable}
        onUpdateVariable={onUpdateVariable}
      />
    </SettingsPageLayout>
  );
};
