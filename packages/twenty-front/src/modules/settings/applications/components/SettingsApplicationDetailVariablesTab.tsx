import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ApplicationVariableOption } from 'twenty-shared/application';
import { LightButton } from 'twenty-ui/components/input';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';
import { type ApplicationVariable } from '~/generated-metadata/graphql';
import { SettingsApplicationVariableInput } from '@/settings/applications/components/SettingsApplicationVariableInput';
import { SettingsApplicationVariableLabelRow } from '@/settings/applications/components/SettingsApplicationVariableLabelRow';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledClearRow = styled.div`
  display: flex;
  margin-top: ${themeCssVariables.spacing[1]};
`;

type SettingsApplicationDetailVariablesTabProps = {
  applicationVariables: (Pick<
    ApplicationVariable,
    | 'key'
    | 'label'
    | 'description'
    | 'isDeprecated'
    | 'isSecret'
    | 'type'
    | 'value'
    | 'options'
  > & { savedValue: string; isCleared: boolean })[];
  onVariableChange: (key: string, value: string) => void;
  onVariableClear: (key: string) => void;
};

export const SettingsApplicationDetailVariablesTab = ({
  applicationVariables,
  onVariableChange,
  onVariableClear,
}: SettingsApplicationDetailVariablesTabProps) => {
  const sectionDescription =
    applicationVariables.length > 0
      ? t`Set your application configuration variables`
      : t`No variables to set for this application`;

  return (
    <Section.Root>
      <Section.Header title={t`Variables`} description={sectionDescription} />
      <StyledContainer>
        {applicationVariables.map((applicationVariable) => {
          const hasStoredSecret =
            applicationVariable.isSecret &&
            isNonEmptyString(applicationVariable.savedValue) &&
            !applicationVariable.isCleared;

          return (
            <div key={applicationVariable.key}>
              <SettingsApplicationVariableLabelRow
                variableKey={applicationVariable.key}
                label={applicationVariable.label}
                isDeprecated={applicationVariable.isDeprecated}
                description={applicationVariable.description}
              />
              <SettingsApplicationVariableInput
                type={applicationVariable.type}
                value={applicationVariable.value}
                options={
                  applicationVariable.options as
                    | ApplicationVariableOption[]
                    | null
                    | undefined
                }
                onChange={(newValue) =>
                  onVariableChange(applicationVariable.key, newValue)
                }
                isSecret={applicationVariable.isSecret}
                placeholder={
                  hasStoredSecret ? applicationVariable.savedValue : t`Value`
                }
              />
              {hasStoredSecret && (
                <StyledClearRow>
                  <LightButton
                    emphasis="subtle"
                    onClick={() => onVariableClear(applicationVariable.key)}
                  >{t`Clear stored value`}</LightButton>
                </StyledClearRow>
              )}
            </div>
          );
        })}
      </StyledContainer>
    </Section.Root>
  );
};
