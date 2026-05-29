import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
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
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { NotFound } from '~/pages/not-found/NotFound';
import { ApplicationRegistrationConfigVariableEditForm } from '@/settings/application-registrations/components/ApplicationRegistrationConfigVariableEditForm';

export const SettingsAdminApplicationRegistrationConfigVariableDetail = () => {
  const { t } = useLingui();
  const apolloAdminClient = useApolloAdminClient();

  const { variableKey, applicationRegistrationId = '' } = useParams<{
    applicationRegistrationId: string;
    variableKey: string;
  }>();

  const { data: applicationRegistrationData, loading: registrationLoading } =
    useQuery(FindOneAdminApplicationRegistrationDocument, {
      client: apolloAdminClient,
      variables: { id: applicationRegistrationId },
      skip: !applicationRegistrationId,
    });

  const registration =
    applicationRegistrationData?.findOneAdminApplicationRegistration;

  const { data: variablesData, loading: variablesLoading } = useQuery(
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
      <ApplicationRegistrationConfigVariableEditForm
        variable={variable}
        onUpdateVariable={onUpdateVariable}
      />
    </SubMenuTopBarContainer>
  );
};
