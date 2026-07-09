import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext, useState } from 'react';
import { type ApplicationVariableOption } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { IconInfoCircle } from 'twenty-ui/icon';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { H2Title } from 'twenty-ui/typography';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useDebouncedCallback } from 'use-debounce';
import { type ApplicationVariable } from '~/generated-metadata/graphql';
import { SettingsApplicationVariableInput } from '~/pages/settings/applications/components/SettingsApplicationVariableInput';

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

export const SettingsApplicationDetailEnvironmentVariablesTable = ({
  envVariables,
  onUpdate,
}: {
  envVariables: ApplicationVariable[];
  onUpdate: (newEnv: Pick<ApplicationVariable, 'key' | 'value'>) => void;
  readonly?: boolean;
}) => {
  const { theme } = useContext(ThemeContext);
  const [editedEnvVariables, setEditedEnvVariables] = useState(envVariables);
  const onUpdateDebounced = useDebouncedCallback(
    (value: Pick<ApplicationVariable, 'key' | 'value'>) => {
      onUpdate(value);
    },
    250,
  );
  const sectionDescription =
    editedEnvVariables.length > 0
      ? t`Set your application configuration variables`
      : t`No variables to set for this application`;

  const getVariableCategory = (variable: ApplicationVariable) =>
    isNonEmptyString(variable.category) ? variable.category : t`Configuration`;

  const getVariablePosition = (variable: ApplicationVariable) =>
    isDefined(variable.position) ? variable.position : Number.POSITIVE_INFINITY;

  const sortedEnvVariables = [...editedEnvVariables].sort((a, b) => {
    const positionDifference = getVariablePosition(a) - getVariablePosition(b);
    return positionDifference !== 0
      ? positionDifference
      : a.key.localeCompare(b.key);
  });

  const categories = sortedEnvVariables.reduce<string[]>((acc, variable) => {
    const category = getVariableCategory(variable);
    if (!acc.includes(category)) {
      acc.push(category);
    }
    return acc;
  }, []);

  const renderVariable = (editedEnvVariable: ApplicationVariable) => {
    const tooltipId = `env-var-desc-${editedEnvVariable.key}`;
    return (
      <div key={editedEnvVariable.key}>
        <StyledLabelRow>
          <StyledLabel>{editedEnvVariable.key}</StyledLabel>
          {isNonEmptyString(editedEnvVariable.description) && (
            <>
              <IconInfoCircle
                id={`env-var-desc-${editedEnvVariable.key}`}
                size={theme.icon.size.sm}
                color={theme.font.color.tertiary}
                style={{ outline: 'none', cursor: 'pointer' }}
              />
              <AppTooltip
                anchorSelect={`#${tooltipId}`}
                content={editedEnvVariable.description}
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
          type={editedEnvVariable.type}
          value={editedEnvVariable.value}
          options={
            editedEnvVariable.options as
              | ApplicationVariableOption[]
              | null
              | undefined
          }
          onChange={(newValue) => {
            setEditedEnvVariables((prevState) =>
              prevState.map((val) => {
                if (val.key === editedEnvVariable.key) {
                  return { ...val, value: newValue };
                }
                return val;
              }),
            );
            onUpdateDebounced({ ...editedEnvVariable, value: newValue });
          }}
          placeholder={t`Value`}
        />
      </div>
    );
  };

  if (editedEnvVariables.length === 0) {
    return (
      <Section>
        <H2Title title={t`Configuration`} description={sectionDescription} />
      </Section>
    );
  }

  return (
    <>
      {categories.map((category, categoryIndex) => {
        const variablesInCategory = sortedEnvVariables.filter(
          (variable) => getVariableCategory(variable) === category,
        );
        return (
          <Section key={category}>
            <H2Title
              title={category}
              description={categoryIndex === 0 ? sectionDescription : undefined}
            />
            <StyledContainer>
              {variablesInCategory.map(renderVariable)}
            </StyledContainer>
          </Section>
        );
      })}
    </>
  );
};
