import type { ApplicationRegistrationData } from '~/pages/settings/applications/tabs/types/ApplicationRegistrationData';
import { useQuery } from '@apollo/client/react';
import {
  type ApplicationRegistrationVariable,
  FindApplicationRegistrationVariablesDocument,
} from '~/generated-metadata/graphql';
import { Section } from 'twenty-ui/layout';
import { H2Title, Status } from 'twenty-ui/display';
import { useLingui } from '@lingui/react/macro';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { ConfigVariableTable } from '@/settings/config-variables/components/ConfigVariableTable';

export const SettingsApplicationRegistrationConfigTab = ({
  registration,
}: {
  registration: ApplicationRegistrationData;
}) => {
  const { t } = useLingui();

  const applicationRegistrationId = registration.id;

  const { data: variablesData } = useQuery(
    FindApplicationRegistrationVariablesDocument,
    {
      variables: { applicationRegistrationId },
      skip: !applicationRegistrationId,
    },
  );

  const variables: ApplicationRegistrationVariable[] =
    variablesData?.findApplicationRegistrationVariables ?? [];

  const configVariables = variables.map((variable) => ({
    name: variable.key,
    description: variable.description,
    value: variable.isFilled ? (
      '••••••••••'
    ) : (
      <Status color="gray" text={t`Not set`} />
    ),
    to: getSettingsPath(
      SettingsPath.ApplicationRegistrationConfigVariableDetails,
      {
        applicationRegistrationId,
        variableKey: variable.key,
      },
    ),
  }));

  return (
    variables.length > 0 && (
      <Section>
        <H2Title
          title={t`Server Variables`}
          description={t`Server variables are applied to all workspace installations.`}
        />
        <ConfigVariableTable configVariables={configVariables} />
      </Section>
    )
  );
};
