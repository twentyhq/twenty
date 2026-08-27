import 'twenty-ui/style.css';

import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { useId, useState } from 'react';
import { useColorScheme } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/layout';
import { Card } from 'twenty-ui/surfaces';
import { THEME_DARK, THEME_LIGHT, type ThemeColor } from 'twenty-ui/theme';
import {
  ThemeContext,
  themeCssVariables,
  type ThemeType,
} from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { AdornedHexInput } from 'src/front-components/components/AdornedHexInput';
import { ApplicationVariableRow } from 'src/front-components/components/ApplicationVariableRow';
import { LabelledSettingsField } from 'src/front-components/components/LabelledSettingsField';
import { SettingsOptionCardContentCounter } from 'src/front-components/components/SettingsOptionCardContentCounter';
import { SettingsOptionCardContentSelect } from 'src/front-components/components/SettingsOptionCardContentSelect';
import { SettingsOptionCardContentToggle } from 'src/front-components/components/SettingsOptionCardContentToggle';
import { StyledSettingsTextArea } from 'src/front-components/components/StyledSettingsTextArea';
import { StyledSettingsTextInput } from 'src/front-components/components/StyledSettingsTextInput';
import { TileBackgroundControl } from 'src/front-components/components/TileBackgroundControl';
import { TranscriptProviderControl } from 'src/front-components/components/TranscriptProviderControl';
import {
  CALL_RECORDER_MAPPED_VARIABLE_KEYS,
  CALL_RECORDER_NAME_FIELD,
  CALL_RECORDER_SUMMARY_ENABLED_ROW,
  CALL_RECORDER_SUMMARY_PROMPT_FIELD,
  CALL_RECORDER_TILE_BACKGROUND_ROW,
  CALL_RECORDER_TIMING_ROWS,
  CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW,
  CALL_RECORDER_USE_WORKSPACE_LOGO_ROW,
} from 'src/front-components/constants/call-recorder-settings-layout.constant';
import { THEME_COLOR_HEX } from 'src/front-components/constants/theme-color-hex.constant';
import { useCallRecorderApplicationVariables } from 'src/front-components/hooks/use-call-recorder-application-variables';
import { useSaveApplicationVariables } from 'src/front-components/hooks/use-save-application-variables';
import { getNormalizedNumberValue } from 'src/front-components/utils/get-normalized-number-value.util';
import { getThemeColorFromHex } from 'src/front-components/utils/get-theme-color-from-hex.util';
import { normalizeHexColor } from 'src/front-components/utils/normalize-hex-color.util';
import { serializeRichTextMarkdown } from 'src/front-components/utils/serialize-rich-text-markdown.util';
import { DEFAULT_CALL_RECORDER_BOT_IMAGE_BACKGROUND } from 'src/logic-functions/constants/default-call-recorder-bot-image-background';
import { extractRichTextMarkdown } from 'src/logic-functions/utils/extract-rich-text-markdown.util';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledBlocks = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[4]};
`;

const StyledDimmable = styled.div<{ $dimmed: boolean }>`
  opacity: ${({ $dimmed }) => ($dimmed ? 0.5 : 1)};
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

  const [draftValueByVariableKey, setDraftValueByVariableKey] = useState<
    Record<string, string>
  >({});
  const [isCustomHexOverride, setIsCustomHexOverride] = useState<
    boolean | undefined
  >(undefined);

  const colorScheme = useColorScheme();
  const fieldIdPrefix = useId();
  const { saveVariable, flushVariable, cancelVariable } =
    useSaveApplicationVariables(applicationId ?? '');

  if (isApplicationVariablesQueryLoading) {
    return <StyledCenteredState>Loading settings…</StyledCenteredState>;
  }

  if (isUndefined(applicationId)) {
    return <StyledCenteredState>{errorMessage}</StyledCenteredState>;
  }

  const variableByKey = Object.fromEntries(
    applicationVariables.map((variable) => [variable.key, variable]),
  );

  const getValue = (variableKey: string) =>
    draftValueByVariableKey[variableKey] ??
    variableByKey[variableKey]?.value ??
    '';

  const setDraftValue = (variableKey: string, value: string) =>
    setDraftValueByVariableKey((previousDraftValues) => ({
      ...previousDraftValues,
      [variableKey]: value,
    }));

  const handleChange = (variableKey: string, value: string) => {
    setDraftValue(variableKey, value);
    saveVariable(variableKey, value);
  };

  const handleNumberChange = (variableKey: string, value: string) => {
    setDraftValue(variableKey, value);

    const valueToSave = getNormalizedNumberValue(value);

    if (isUndefined(valueToSave)) {
      cancelVariable(variableKey);
      return;
    }

    saveVariable(variableKey, valueToSave);
  };

  const isSummaryEnabled =
    getValue(CALL_RECORDER_SUMMARY_ENABLED_ROW.variableKey) === 'true';
  const isWorkspaceLogoEnabled =
    getValue(CALL_RECORDER_USE_WORKSPACE_LOGO_ROW.variableKey) === 'true';

  const tileBackgroundValue = getValue(
    CALL_RECORDER_TILE_BACKGROUND_ROW.variableKey,
  );
  const selectedTileColor = getThemeColorFromHex(tileBackgroundValue);
  const isCustomHexSelected =
    isCustomHexOverride ?? isUndefined(selectedTileColor);

  const handleSelectTileColor = (color: ThemeColor) => {
    setIsCustomHexOverride(false);
    handleChange(
      CALL_RECORDER_TILE_BACKGROUND_ROW.variableKey,
      THEME_COLOR_HEX[color],
    );
  };

  const otherVariables = applicationVariables.filter(
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
          title="In the call"
          description="How the recorder joins your meetings, and when it gives up or stops."
        />
        <StyledBlocks>
          <LabelledSettingsField
            label={CALL_RECORDER_NAME_FIELD.label}
            inputId={`${fieldIdPrefix}-name`}
            hint={CALL_RECORDER_NAME_FIELD.hint}
          >
            <StyledSettingsTextInput
              id={`${fieldIdPrefix}-name`}
              type="text"
              autoComplete="off"
              placeholder="Value"
              value={getValue(CALL_RECORDER_NAME_FIELD.variableKey)}
              onChange={(event) =>
                handleChange(
                  CALL_RECORDER_NAME_FIELD.variableKey,
                  event.target.value,
                )
              }
              onBlur={() => flushVariable(CALL_RECORDER_NAME_FIELD.variableKey)}
            />
          </LabelledSettingsField>
          <Card rounded fullWidth>
            {CALL_RECORDER_TIMING_ROWS.map((row, rowIndex) => {
              const value = getValue(row.variableKey);

              return (
                <SettingsOptionCardContentCounter
                  key={row.variableKey}
                  Icon={row.Icon}
                  title={row.title}
                  description={row.description}
                  divider={rowIndex < CALL_RECORDER_TIMING_ROWS.length - 1}
                  inputId={`${fieldIdPrefix}-${row.variableKey}`}
                  value={value}
                  errorMessage={
                    isUndefined(getNormalizedNumberValue(value))
                      ? 'Invalid number'
                      : undefined
                  }
                  onChange={(newValue) =>
                    handleNumberChange(row.variableKey, newValue)
                  }
                  onBlur={() => flushVariable(row.variableKey)}
                />
              );
            })}
          </Card>
        </StyledBlocks>
      </Section>

      <Section>
        <H2Title
          title="Transcription & AI"
          description="What happens to a recording once the call ends."
        />
        <StyledBlocks>
          <Card rounded fullWidth>
            <SettingsOptionCardContentSelect
              Icon={CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW.Icon}
              title={CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW.title}
              description={CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW.description}
              divider
            >
              <TranscriptProviderControl
                value={getValue(
                  CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW.variableKey,
                )}
                options={
                  variableByKey[CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW.variableKey]
                    ?.options ?? []
                }
                onChange={(newValue) =>
                  handleChange(
                    CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW.variableKey,
                    newValue,
                  )
                }
              />
            </SettingsOptionCardContentSelect>
            <SettingsOptionCardContentToggle
              Icon={CALL_RECORDER_SUMMARY_ENABLED_ROW.Icon}
              title={CALL_RECORDER_SUMMARY_ENABLED_ROW.title}
              description={CALL_RECORDER_SUMMARY_ENABLED_ROW.description}
              checked={isSummaryEnabled}
              onChange={(checked) =>
                handleChange(
                  CALL_RECORDER_SUMMARY_ENABLED_ROW.variableKey,
                  checked ? 'true' : 'false',
                )
              }
            />
          </Card>
          <StyledDimmable $dimmed={!isSummaryEnabled}>
            <LabelledSettingsField
              label={CALL_RECORDER_SUMMARY_PROMPT_FIELD.label}
              inputId={`${fieldIdPrefix}-prompt`}
              hint={CALL_RECORDER_SUMMARY_PROMPT_FIELD.hint}
            >
              <StyledSettingsTextArea
                id={`${fieldIdPrefix}-prompt`}
                placeholder="Value"
                value={
                  extractRichTextMarkdown(
                    getValue(CALL_RECORDER_SUMMARY_PROMPT_FIELD.variableKey),
                  ) ?? ''
                }
                onChange={(event) =>
                  handleChange(
                    CALL_RECORDER_SUMMARY_PROMPT_FIELD.variableKey,
                    serializeRichTextMarkdown(event.target.value),
                  )
                }
                onBlur={() =>
                  flushVariable(CALL_RECORDER_SUMMARY_PROMPT_FIELD.variableKey)
                }
              />
            </LabelledSettingsField>
          </StyledDimmable>
        </StyledBlocks>
      </Section>

      <Section>
        <H2Title
          title="Bot appearance"
          description="What participants see on the recorder's camera tile."
        />
        <StyledBlocks>
          <Card rounded fullWidth>
            <SettingsOptionCardContentToggle
              Icon={CALL_RECORDER_USE_WORKSPACE_LOGO_ROW.Icon}
              title={CALL_RECORDER_USE_WORKSPACE_LOGO_ROW.title}
              description={CALL_RECORDER_USE_WORKSPACE_LOGO_ROW.description}
              divider
              checked={isWorkspaceLogoEnabled}
              onChange={(checked) =>
                handleChange(
                  CALL_RECORDER_USE_WORKSPACE_LOGO_ROW.variableKey,
                  checked ? 'true' : 'false',
                )
              }
            />
            <StyledDimmable $dimmed={!isWorkspaceLogoEnabled}>
              <SettingsOptionCardContentSelect
                Icon={CALL_RECORDER_TILE_BACKGROUND_ROW.Icon}
                title={CALL_RECORDER_TILE_BACKGROUND_ROW.title}
                description={CALL_RECORDER_TILE_BACKGROUND_ROW.description}
              >
                <TileBackgroundControl
                  swatchColor={
                    normalizeHexColor(tileBackgroundValue) ??
                    DEFAULT_CALL_RECORDER_BOT_IMAGE_BACKGROUND
                  }
                  selectedColor={selectedTileColor}
                  isCustomSelected={isCustomHexSelected}
                  disabled={!isWorkspaceLogoEnabled}
                  onSelectColor={handleSelectTileColor}
                  onSelectCustom={() => setIsCustomHexOverride(true)}
                />
              </SettingsOptionCardContentSelect>
            </StyledDimmable>
          </Card>
          {isCustomHexSelected && (
            <StyledDimmable $dimmed={!isWorkspaceLogoEnabled}>
              <LabelledSettingsField
                label="Custom hex"
                inputId={`${fieldIdPrefix}-hex`}
                hint="Six-digit hex, for example #1d1d1d."
                errorMessage={
                  isUndefined(normalizeHexColor(tileBackgroundValue)) &&
                  tileBackgroundValue !== ''
                    ? 'Invalid hex colour'
                    : undefined
                }
              >
                <AdornedHexInput
                  id={`${fieldIdPrefix}-hex`}
                  value={tileBackgroundValue}
                  swatchColor={
                    normalizeHexColor(tileBackgroundValue) ??
                    DEFAULT_CALL_RECORDER_BOT_IMAGE_BACKGROUND
                  }
                  onChange={(newValue) =>
                    handleChange(
                      CALL_RECORDER_TILE_BACKGROUND_ROW.variableKey,
                      newValue,
                    )
                  }
                  onBlur={() =>
                    flushVariable(CALL_RECORDER_TILE_BACKGROUND_ROW.variableKey)
                  }
                />
              </LabelledSettingsField>
            </StyledDimmable>
          )}
        </StyledBlocks>
      </Section>

      {otherVariables.length > 0 && (
        <Section>
          <H2Title
            title="Other"
            description="Variables this app does not lay out explicitly."
          />
          <StyledBlocks>
            {otherVariables.map((variable) => (
              <ApplicationVariableRow
                key={variable.key}
                variable={variable}
                applicationId={applicationId}
                value={draftValueByVariableKey[variable.key]}
                onValueChange={({ variableKey, value }) =>
                  setDraftValue(variableKey, value)
                }
              />
            ))}
          </StyledBlocks>
        </Section>
      )}
    </StyledContainer>
    </ThemeContext.Provider>
  );
};
