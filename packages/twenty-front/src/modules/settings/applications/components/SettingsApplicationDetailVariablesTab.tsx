import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ApplicationVariableOption } from 'twenty-shared/application';
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
  > & { savedValue: string })[];
  onVariableChange: (key: string, value: string) => void;
};

export const SettingsApplicationDetailVariablesTab = ({
  applicationVariables,
  onVariableChange,
}: SettingsApplicationDetailVariablesTabProps) => {
  const sectionDescription =
    applicationVariables.length > 0
      ? t`Set your application configuration variables`
      : t`No variables to set for this application`;

  return (
    <Section.Root>
      <Section.Header title={t`Variables`} description={sectionDescription} />
      <StyledContainer>
        {applicationVariables.map((applicationVariable) => (
          <div key={applicationVariable.key}>
            <SettingsApplicationVariableLabelRow
              variableKey={applicationVariable.key}
              label={applicationVariable.label}
              isDeprecated={applicationVariable.isDeprecated}
              description={applicationVariable.description}
              tooltipId={`env-var-desc-${applicationVariable.key}`}
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
                applicationVariable.isSecret &&
                isNonEmptyString(applicationVariable.savedValue)
                  ? applicationVariable.savedValue
                  : t`Value`
              }
            />
          </div>
        ))}
      </StyledContainer>
    </Section.Root>
  );
};
