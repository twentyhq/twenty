import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import {
  FindApplicationRegistrationVariablesDocument,
  FindOneApplicationRegistrationDocument,
  UpdateApplicationRegistrationVariableDocument,
} from '~/generated-metadata/graphql';
import { useMutation, useQuery } from '@apollo/client/react';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { ApplicationRegistrationConfigVariableEditForm } from '@/settings/application-registrations/components/ApplicationRegistrationConfigVariableEditForm';

export const SettingsApplicationRegistrationConfigVariableDetail = () => {
  const { t } = useLingui();

  const { variableKey, applicationRegistrationId = '' } = useParams<{
    applicationRegistrationId: string;
    variableKey: string;
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
      <ApplicationRegistrationConfigVariableEditForm
        variable={variable}
        onUpdateVariable={onUpdateVariable}
      />
    </SubMenuTopBarContainer>
  );
};
