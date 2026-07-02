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
import { IconInfoCircle } from 'twenty-ui/icon';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { type ApplicationVariableOption } from 'twenty-shared/application';
import { useDebouncedCallback } from 'use-debounce';
import { SettingsApplicationVariableInput } from '~/pages/settings/applications/components/SettingsApplicationVariableInput';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledLabelRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: 11px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

export const SettingsApplicationRegistrationConfigTab = ({
  registration,
  fromAdmin,
}: {
  registration: ApplicationRegistrationData;
  fromAdmin?: boolean;
}) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
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

  const variables = fromAdmin
    ? (adminVariablesData?.findAdminApplicationRegistrationVariables ?? [])
    : (workspaceVariablesData?.findApplicationRegistrationVariables ?? []);

  const onUpdateDebounced = useDebouncedCallback(
    (id: string, value: string) => {
      if (fromAdmin === true) {
        updateAdminVariable({
          variables: { input: { id, update: { value } } },
        });
      } else {
        updateWorkspaceVariable({
          variables: { input: { id, update: { value } } },
        });
      }
    },
    250,
  );

  return (
    variables.length > 0 && (
      <Section>
        <H2Title
          title={t`Server Variables`}
          description={t`Server variables are applied to all workspace installations.`}
        />
        <StyledContainer>
          {variables.map((variable) => {
            const tooltipId = `config-var-desc-${variable.key}`;
            return (
              <div key={variable.key}>
                <StyledLabelRow>
                  <StyledLabel>{variable.key}</StyledLabel>
                  {isNonEmptyString(variable.description) && (
                    <>
                      <IconInfoCircle
                        id={tooltipId}
                        size={theme.icon.size.sm}
                        color={theme.font.color.tertiary}
                        style={{ outline: 'none', cursor: 'pointer' }}
                      />
                      <AppTooltip
                        anchorSelect={`#${tooltipId}`}
                        content={variable.description}
                        offset={5}
                        noArrow
                        place="bottom"
                        positionStrategy="fixed"
                        delay={TooltipDelay.shortDelay}
                      />
                    </>
                  )}
                </StyledLabelRow>
                <SettingsApplicationVariableInput
                  type={variable.type}
                  value={variable.value ?? ''}
                  options={
                    variable.options as
                      | ApplicationVariableOption[]
                      | null
                      | undefined
                  }
                  onChange={(newValue) =>
                    onUpdateDebounced(variable.id, newValue)
                  }
                  placeholder={t`Value`}
                />
              </div>
            );
          })}
        </StyledContainer>
      </Section>
    )
  );
};
