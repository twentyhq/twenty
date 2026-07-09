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
import { useContext, useState } from 'react';
import { type ApplicationVariableOption } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import { SettingsApplicationVariableInput } from '~/pages/settings/applications/components/SettingsApplicationVariableInput';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';

type ConfigVariable = {
  id: string;
  key: string;
  value?: string | null;
  type?: string | null;
  options?: ApplicationVariableOption[] | null;
  isSecret?: boolean | null;
  isFilled?: boolean | null;
  description?: string | null;
  category?: string | null;
  position?: number | null;
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

  const variables = (
    fromAdmin
      ? (adminVariablesData?.findAdminApplicationRegistrationVariables ?? [])
      : (workspaceVariablesData?.findApplicationRegistrationVariables ?? [])
  ) as ConfigVariable[];

  const getVariableCategory = (variable: ConfigVariable) =>
    isNonEmptyString(variable.category)
      ? variable.category
      : t`Server Variables`;

  const getVariablePosition = (variable: ConfigVariable) =>
    isDefined(variable.position) ? variable.position : Number.POSITIVE_INFINITY;

  const sortedVariables = [...variables].sort((a, b) => {
    const positionDifference = getVariablePosition(a) - getVariablePosition(b);
    return positionDifference !== 0
      ? positionDifference
      : a.key.localeCompare(b.key);
  });

  const categories = sortedVariables.reduce<string[]>((acc, variable) => {
    const category = getVariableCategory(variable);
    if (!acc.includes(category)) {
      acc.push(category);
    }
    return acc;
  }, []);

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

  if (sortedVariables.length === 0) {
    return null;
  }

  return (
    <>
      {categories.map((category, categoryIndex) => {
        const variablesInCategory = sortedVariables.filter(
          (variable) => getVariableCategory(variable) === category,
        );
        return (
          <Section key={category}>
            <H2Title
              title={category}
              description={
                categoryIndex === 0
                  ? t`Server variables are applied to all workspace installations.`
                  : undefined
              }
            />
            <StyledContainer>
              {variablesInCategory.map((variable) => {
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
                    <ConfigVariableInput
                      variable={variable}
                      onUpdate={handleUpdate}
                    />
                  </div>
                );
              })}
            </StyledContainer>
          </Section>
        );
      })}
    </>
  );
};
