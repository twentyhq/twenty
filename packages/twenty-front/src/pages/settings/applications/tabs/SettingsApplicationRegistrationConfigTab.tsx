import type { ApplicationRegistrationData } from '~/pages/settings/applications/tabs/types/ApplicationRegistrationData';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  FindApplicationRegistrationVariablesDocument,
  UpdateApplicationRegistrationVariableDocument,
} from '~/generated-metadata/graphql';
import {
  FindAdminApplicationRegistrationVariablesDocument,
  UpdateAdminApplicationRegistrationVariableDocument,
} from '~/generated-admin/graphql';
import { styled } from '@linaria/react';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { type ApplicationVariableOption } from 'twenty-shared/application';
import { useDebouncedCallback } from 'use-debounce';
import { SettingsApplicationVariableInput } from '~/pages/settings/applications/components/SettingsApplicationVariableInput';
import { SettingsApplicationVariableLabelRow } from '~/pages/settings/applications/components/SettingsApplicationVariableLabelRow';
import { shouldDisplayVariable } from '~/pages/settings/applications/utils/shouldDisplayVariable';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';

type ConfigVariable = {
  id: string;
  key: string;
  value?: string | null;
  type?: string | null;
  options?: ApplicationVariableOption[] | null;
  isSecret?: boolean | null;
  isFilled?: boolean | null;
};

const ConfigVariableInput = ({
  variable,
  onUpdate,
}: {
  variable: ConfigVariable;
  onUpdate: (id: string, value: string) => void;
}) => {
  const { t } = useLingui();

  const isSecretFilled =
    variable.isSecret === true && variable.isFilled === true;

  const [value, setValue] = useState(
    isSecretFilled ? '' : (variable.value ?? ''),
  );

  const onUpdateDebounced = useDebouncedCallback((newValue: string) => {
    onUpdate(variable.id, newValue);
  }, 250);

  return (
    <SettingsApplicationVariableInput
      type={variable.type}
      value={value}
      options={variable.options}
      onChange={(newValue) => {
        setValue(newValue);
        onUpdateDebounced(newValue);
      }}
      placeholder={isSecretFilled ? (variable.value ?? undefined) : t`Value`}
    />
  );
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

export const SettingsApplicationRegistrationConfigTab = ({
  registration,
  fromAdmin,
}: {
  registration: ApplicationRegistrationData;
  fromAdmin?: boolean;
}) => {
  const { t } = useLingui();
  const apolloAdminClient = useApolloAdminClient();

  const applicationRegistrationId = registration.id;

  const { data: workspaceVariablesData } = useQuery(
    FindApplicationRegistrationVariablesDocument,
    {
      variables: { applicationRegistrationId },
      skip: !applicationRegistrationId || fromAdmin === true,
    },
  );

  const { data: adminVariablesData } = useQuery(
    FindAdminApplicationRegistrationVariablesDocument,
    {
      client: apolloAdminClient,
      variables: { applicationRegistrationId },
      skip: !applicationRegistrationId || fromAdmin !== true,
    },
  );

  const [updateWorkspaceVariable] = useMutation(
    UpdateApplicationRegistrationVariableDocument,
    {
      refetchQueries: [FindApplicationRegistrationVariablesDocument],
    },
  );

  const [updateAdminVariable] = useMutation(
    UpdateAdminApplicationRegistrationVariableDocument,
    {
      client: apolloAdminClient,
      refetchQueries: [FindAdminApplicationRegistrationVariablesDocument],
    },
  );

  const variables = (
    fromAdmin
      ? (adminVariablesData?.findAdminApplicationRegistrationVariables ?? [])
      : (workspaceVariablesData?.findApplicationRegistrationVariables ?? [])
  ).filter((variable) =>
    shouldDisplayVariable({
      isDeprecated: variable.isDeprecated,
      hasValue: variable.isFilled,
    }),
  );

  const handleUpdate = (id: string, value: string) => {
    if (fromAdmin === true) {
      updateAdminVariable({
        variables: { input: { id, update: { value } } },
      });
    } else {
      updateWorkspaceVariable({
        variables: { input: { id, update: { value } } },
      });
    }
  };

  return (
    variables.length > 0 && (
      <Section>
        <H2Title
          title={t`Server Variables`}
          description={t`Server variables are applied to all workspace installations.`}
        />
        <StyledContainer>
          {variables.map((variable) => {
            return (
              <div key={variable.key}>
                <SettingsApplicationVariableLabelRow
                  variableKey={variable.key}
                  isDeprecated={variable.isDeprecated}
                  description={variable.description}
                  tooltipId={`config-var-desc-${variable.key}`}
                />
                <ConfigVariableInput
                  variable={variable as ConfigVariable}
                  onUpdate={handleUpdate}
                />
              </div>
            );
          })}
        </StyledContainer>
      </Section>
    )
  );
};
