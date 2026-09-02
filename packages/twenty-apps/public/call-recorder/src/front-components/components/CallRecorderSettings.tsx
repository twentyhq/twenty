import 'twenty-ui/style.css';

import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { useState } from 'react';
import { useColorScheme } from 'twenty-sdk/front-component';
import { IconDeviceFloppy } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { THEME_DARK, THEME_LIGHT } from 'twenty-ui/theme';
import {
  ThemeContext,
  themeCssVariables,
  type ThemeType,
} from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { ApplicationVariableRow } from 'src/front-components/components/ApplicationVariableRow';
import { RecorderSection } from 'src/front-components/components/RecorderSection';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { TimingSection } from 'src/front-components/components/TimingSection';
import { TranscriptionSection } from 'src/front-components/components/TranscriptionSection';
import { CALL_RECORDER_MAPPED_VARIABLE_KEYS } from 'src/front-components/constants/call-recorder-settings-layout.constant';
import { useCallRecorderApplicationVariables } from 'src/front-components/hooks/use-call-recorder-application-variables';
import { useSaveApplicationVariable } from 'src/front-components/hooks/use-save-application-variable';
import {
  type ApplicationVariableDraftByKey,
  type UpdateApplicationVariableDraft,
} from 'src/front-components/types/application-variable-draft.type';
import { getOptimisticApplicationVariableValue } from 'src/front-components/utils/get-optimistic-application-variable-value.util';
import { isApplicationVariableDraftUnchanged } from 'src/front-components/utils/is-application-variable-draft-unchanged.util';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledSettingsFieldset = styled.fieldset`
  border: none;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[8]};
  margin: 0;
  min-width: 0;
  padding: 0;

  &:disabled {
    pointer-events: none;
  }
`;

const StyledCenteredState = styled.div`
  align-items: center;
  box-sizing: border-box;
  color: ${() => themeCssVariables.font.color.tertiary};
  display: flex;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  height: 100%;
  justify-content: center;
  padding: ${() => themeCssVariables.spacing[4]};
  width: 100%;
`;

export const CallRecorderSettings = () => {
  const {
    applicationId,
    applicationVariables,
    isApplicationVariablesQueryLoading,
    errorMessage,
  } = useCallRecorderApplicationVariables();

  const [draftValueByVariableKey, setDraftValueByVariableKey] =
    useState<ApplicationVariableDraftByKey>({});
  const [persistedValueByVariableKey, setPersistedValueByVariableKey] =
    useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const colorScheme = useColorScheme();
  const { saveApplicationVariable } = useSaveApplicationVariable(applicationId);

  if (isApplicationVariablesQueryLoading) {
    return <StyledCenteredState>Loading settings…</StyledCenteredState>;
  }

  if (isUndefined(applicationId)) {
    return <StyledCenteredState>{errorMessage}</StyledCenteredState>;
  }

  const currentApplicationVariables = applicationVariables.map((variable) => ({
    ...variable,
    value: persistedValueByVariableKey[variable.key] ?? variable.value,
  }));

  const handleDraftValueChange: UpdateApplicationVariableDraft = ({
    variableKey,
    inputValue,
    valueToSave,
  }) => {
    const currentVariable = currentApplicationVariables.find(
      (variable) => variable.key === variableKey,
    );

    if (isUndefined(currentVariable)) {
      return;
    }

    setDraftValueByVariableKey((previousDraftValues) => {
      if (
        !isUndefined(valueToSave) &&
        isApplicationVariableDraftUnchanged({
          persistedValue: currentVariable.value,
          valueToSave,
          isSecret: currentVariable.isSecret,
        })
      ) {
        const nextDraftValues = { ...previousDraftValues };

        delete nextDraftValues[variableKey];

        return nextDraftValues;
      }

      return {
        ...previousDraftValues,
        [variableKey]: { inputValue, valueToSave },
      };
    });
  };

  const draftEntries = Object.entries(draftValueByVariableKey);
  const hasInvalidDraft = draftEntries.some(([, draftValue]) =>
    isUndefined(draftValue.valueToSave),
  );

  const handleSave = async () => {
    if (hasInvalidDraft || draftEntries.length === 0) {
      return;
    }

    setIsSaving(true);

    try {
      const saveResults = await Promise.all(
        draftEntries.map(async ([variableKey, draftValue]) => {
          const valueToSave = draftValue.valueToSave;
          const isSecret =
            currentApplicationVariables.find(
              (variable) => variable.key === variableKey,
            )?.isSecret ?? false;

          if (isUndefined(valueToSave)) {
            return {
              variableKey,
              valueToSave: '',
              isSecret,
              isSaved: false,
            };
          }

          return {
            variableKey,
            valueToSave,
            isSecret,
            isSaved: await saveApplicationVariable({
              variableKey,
              value: valueToSave,
            }),
          };
        }),
      );

      setPersistedValueByVariableKey((previousPersistedValues) => {
        const nextPersistedValues = { ...previousPersistedValues };

        for (const {
          variableKey,
          valueToSave,
          isSecret,
          isSaved,
        } of saveResults) {
          if (isSaved) {
            nextPersistedValues[variableKey] =
              getOptimisticApplicationVariableValue({
                value: valueToSave,
                isSecret,
              });
          }
        }

        return nextPersistedValues;
      });

      setDraftValueByVariableKey((previousDraftValues) => {
        const nextDraftValues = { ...previousDraftValues };

        for (const { variableKey, valueToSave, isSaved } of saveResults) {
          if (
            isSaved &&
            nextDraftValues[variableKey]?.valueToSave === valueToSave
          ) {
            delete nextDraftValues[variableKey];
          }
        }

        return nextDraftValues;
      });
    } finally {
      setIsSaving(false);
    }
  };

  const otherVariables = currentApplicationVariables.filter(
    (variable) => !CALL_RECORDER_MAPPED_VARIABLE_KEYS.includes(variable.key),
  );

  // twenty-ui components read icon sizes off ThemeContext, and the context
  // default resolves them to var() strings an SVG size attribute cannot use —
  // menu check marks render at their intrinsic size without a real theme here.
  return (
    <ThemeContext.Provider
      value={{
        theme: (colorScheme === 'dark'
          ? THEME_DARK
          : THEME_LIGHT) as unknown as ThemeType,
        colorScheme,
      }}
    >
      <StyledContainer>
        <Section>
          <H2Title
            title="Configuration"
            description="Changes take effect once saved."
            adornment={
              <Button
                title="Save"
                variant="primary"
                size="small"
                accent="blue"
                Icon={IconDeviceFloppy}
                disabled={
                  draftEntries.length === 0 || hasInvalidDraft || isSaving
                }
                isLoading={isSaving}
                onClick={handleSave}
              />
            }
          />
        </Section>
        <StyledSettingsFieldset disabled={isSaving}>
          <TimingSection
            applicationVariables={currentApplicationVariables}
            draftValueByVariableKey={draftValueByVariableKey}
            onDraftValueChange={handleDraftValueChange}
          />
          <TranscriptionSection
            applicationVariables={currentApplicationVariables}
            draftValueByVariableKey={draftValueByVariableKey}
            onDraftValueChange={handleDraftValueChange}
          />
          <RecorderSection
            applicationVariables={currentApplicationVariables}
            draftValueByVariableKey={draftValueByVariableKey}
            onDraftValueChange={handleDraftValueChange}
          />
          {otherVariables.length > 0 && (
            <Section>
              <H2Title
                title="Other"
                description="Variables this app does not lay out explicitly."
              />
              <StyledSettingsSectionStack>
                {otherVariables.map((variable) => (
                  <ApplicationVariableRow
                    key={variable.key}
                    variable={variable}
                    draftValue={draftValueByVariableKey[variable.key]}
                    onDraftValueChange={handleDraftValueChange}
                  />
                ))}
              </StyledSettingsSectionStack>
            </Section>
          )}
        </StyledSettingsFieldset>
      </StyledContainer>
    </ThemeContext.Provider>
  );
};
