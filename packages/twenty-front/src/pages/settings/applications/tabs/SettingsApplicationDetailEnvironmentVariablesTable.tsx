import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { type ApplicationVariableOption } from 'twenty-shared/application';
import { H2Title } from 'twenty-ui/typography';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useDebouncedCallback } from 'use-debounce';
import { type ApplicationVariable } from '~/generated-metadata/graphql';
import { SettingsApplicationVariableInput } from '~/pages/settings/applications/components/SettingsApplicationVariableInput';
import { SettingsApplicationVariableLabelRow } from '~/pages/settings/applications/components/SettingsApplicationVariableLabelRow';
import { countMissingRequiredApplicationVariables } from '~/pages/settings/applications/utils/countMissingRequiredApplicationVariables';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

export const SettingsApplicationDetailEnvironmentVariablesTable = ({
  envVariables,
  onUpdate,
}: {
  envVariables: ApplicationVariable[];
  onUpdate: (newEnv: Pick<ApplicationVariable, 'key' | 'value'>) => void;
  readonly?: boolean;
}) => {
  const [editedEnvVariables, setEditedEnvVariables] = useState(envVariables);
  const onUpdateDebounced = useDebouncedCallback(
    (value: Pick<ApplicationVariable, 'key' | 'value'>) => {
      onUpdate(value);
    },
    250,
  );
  // A required variable left empty means the application cannot run in this workspace, and
  // nothing else on this screen says so: once installed, an application one credential short
  // looks exactly like a finished one.
  const missingRequiredCount = countMissingRequiredApplicationVariables(
    editedEnvVariables,
  );
  const sectionDescription =
    editedEnvVariables.length === 0
      ? t`No variables to set for this application`
      : missingRequiredCount > 0
        ? t`${missingRequiredCount} required variable(s) still empty — this application will not work until they are set`
        : t`Set your application configuration variables`;
  return (
    <Section>
      <H2Title title={t`Configuration`} description={sectionDescription} />
      <StyledContainer>
        {editedEnvVariables.map((editedEnvVariable) => {
          return (
            <div key={editedEnvVariable.key}>
              <SettingsApplicationVariableLabelRow
                variableKey={editedEnvVariable.key}
                label={editedEnvVariable.label}
                isDeprecated={editedEnvVariable.isDeprecated}
                description={editedEnvVariable.description}
                tooltipId={`env-var-desc-${editedEnvVariable.key}`}
              />
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
        })}
      </StyledContainer>
    </Section>
  );
};
