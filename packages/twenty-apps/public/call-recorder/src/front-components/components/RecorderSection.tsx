import { isUndefined } from '@sniptt/guards';
import { useId, useState } from 'react';
import { Section } from 'twenty-ui/layout';
import { type ThemeColor } from 'twenty-ui/theme';
import { H2Title } from 'twenty-ui/typography';

import { AdornedHexInput } from 'src/front-components/components/AdornedHexInput';
import { LabelledSettingsField } from 'src/front-components/components/LabelledSettingsField';
import { SettingsOptionCardContentSelect } from 'src/front-components/components/SettingsOptionCardContentSelect';
import { SettingsOptionCardContentToggle } from 'src/front-components/components/SettingsOptionCardContentToggle';
import { StyledDimmable } from 'src/front-components/components/StyledDimmable';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { StyledSettingsTextInput } from 'src/front-components/components/StyledSettingsTextInput';
import { TileBackgroundControl } from 'src/front-components/components/TileBackgroundControl';
import {
  CALL_RECORDER_NAME_FIELD,
  CALL_RECORDER_TILE_BACKGROUND_ROW,
  CALL_RECORDER_USE_WORKSPACE_LOGO_ROW,
} from 'src/front-components/constants/call-recorder-settings-layout.constant';
import { THEME_COLOR_HEX } from 'src/front-components/constants/theme-color-hex.constant';
import { useAutosaveApplicationVariable } from 'src/front-components/hooks/use-autosave-application-variable';
import { getApplicationVariableValue } from 'src/front-components/utils/get-application-variable-value.util';
import { getNormalizedHexValue } from 'src/front-components/utils/get-normalized-hex-value.util';
import { getThemeColorFromHex } from 'src/front-components/utils/get-theme-color-from-hex.util';
import { normalizeHexColor } from 'src/front-components/utils/normalize-hex-color.util';
import { DEFAULT_CALL_RECORDER_BOT_IMAGE_BACKGROUND } from 'src/logic-functions/constants/default-call-recorder-bot-image-background';

type RecorderSectionProps = {
  frontComponentId: string;
};

export const RecorderSection = ({ frontComponentId }: RecorderSectionProps) => {
  const nameInputId = useId();
  const hexInputId = useId();
  const [nameValue, setNameValue] = useState(() =>
    getApplicationVariableValue(CALL_RECORDER_NAME_FIELD.variableKey),
  );
  const [isWorkspaceLogoEnabled, setIsWorkspaceLogoEnabled] = useState(
    () =>
      getApplicationVariableValue(
        CALL_RECORDER_USE_WORKSPACE_LOGO_ROW.variableKey,
      ) === 'true',
  );
  const [tileBackgroundValue, setTileBackgroundValue] = useState(() =>
    getApplicationVariableValue(CALL_RECORDER_TILE_BACKGROUND_ROW.variableKey),
  );
  const [isCustomHexOverride, setIsCustomHexOverride] = useState<
    boolean | undefined
  >(undefined);

  const { saveDebounced: saveNameDebounced } = useAutosaveApplicationVariable({
    frontComponentId,
    variableKey: CALL_RECORDER_NAME_FIELD.variableKey,
  });
  const { saveImmediately: saveWorkspaceLogoImmediately } =
    useAutosaveApplicationVariable({
      frontComponentId,
      variableKey: CALL_RECORDER_USE_WORKSPACE_LOGO_ROW.variableKey,
    });
  const {
    saveDebounced: saveTileBackgroundDebounced,
    saveImmediately: saveTileBackgroundImmediately,
  } = useAutosaveApplicationVariable({
    frontComponentId,
    variableKey: CALL_RECORDER_TILE_BACKGROUND_ROW.variableKey,
  });

  const selectedTileColor = getThemeColorFromHex(tileBackgroundValue);
  const isCustomHexSelected =
    isCustomHexOverride ?? isUndefined(selectedTileColor);
  const swatchColor =
    normalizeHexColor(tileBackgroundValue) ??
    DEFAULT_CALL_RECORDER_BOT_IMAGE_BACKGROUND;

  const handleNameChange = (value: string) => {
    setNameValue(value);
    saveNameDebounced(value);
  };

  const handleWorkspaceLogoChange = (checked: boolean) => {
    const value = checked ? 'true' : 'false';

    setIsWorkspaceLogoEnabled(checked);
    saveWorkspaceLogoImmediately(value);
  };

  const handleSelectTileColor = (color: ThemeColor) => {
    const value = THEME_COLOR_HEX[color];

    setIsCustomHexOverride(false);
    setTileBackgroundValue(value);
    saveTileBackgroundImmediately(value);
  };

  const handleHexChange = (value: string) => {
    setTileBackgroundValue(value);

    const valueToSave = getNormalizedHexValue(value);

    if (isUndefined(valueToSave)) {
      saveTileBackgroundDebounced.cancel();
      return;
    }

    saveTileBackgroundDebounced(valueToSave);
  };

  return (
    <Section>
      <H2Title
        title="Recorder"
        description="How the recorder appears when it joins your meetings."
      />
      <StyledSettingsSectionStack>
        <LabelledSettingsField
          label={CALL_RECORDER_NAME_FIELD.label}
          inputId={nameInputId}
          hint={CALL_RECORDER_NAME_FIELD.hint}
        >
          <StyledSettingsTextInput
            id={nameInputId}
            type="text"
            autoComplete="off"
            placeholder="Value"
            value={nameValue}
            onChange={(event) => handleNameChange(event.target.value)}
            onBlur={() => saveNameDebounced.flush()}
          />
        </LabelledSettingsField>
        <StyledSettingsCard>
          <SettingsOptionCardContentToggle
            Icon={CALL_RECORDER_USE_WORKSPACE_LOGO_ROW.Icon}
            title={CALL_RECORDER_USE_WORKSPACE_LOGO_ROW.title}
            description={CALL_RECORDER_USE_WORKSPACE_LOGO_ROW.description}
            divider
            checked={isWorkspaceLogoEnabled}
            onChange={handleWorkspaceLogoChange}
          />
          <SettingsOptionCardContentSelect
            Icon={CALL_RECORDER_TILE_BACKGROUND_ROW.Icon}
            title={CALL_RECORDER_TILE_BACKGROUND_ROW.title}
            description={CALL_RECORDER_TILE_BACKGROUND_ROW.description}
            isDimmed={!isWorkspaceLogoEnabled}
          >
            <TileBackgroundControl
              swatchColor={swatchColor}
              selectedColor={
                isCustomHexSelected ? undefined : selectedTileColor
              }
              isCustomSelected={isCustomHexSelected}
              disabled={!isWorkspaceLogoEnabled}
              onSelectColor={handleSelectTileColor}
              onSelectCustom={() => setIsCustomHexOverride(true)}
            />
          </SettingsOptionCardContentSelect>
        </StyledSettingsCard>
        {isCustomHexSelected && (
          <StyledDimmable $dimmed={!isWorkspaceLogoEnabled}>
            <LabelledSettingsField
              label="Custom hex"
              inputId={hexInputId}
              hint="Six-digit hex, for example #1d1d1d."
              errorMessage={
                isUndefined(getNormalizedHexValue(tileBackgroundValue))
                  ? 'Invalid hex colour'
                  : undefined
              }
            >
              <AdornedHexInput
                id={hexInputId}
                value={tileBackgroundValue}
                swatchColor={swatchColor}
                onChange={handleHexChange}
                onBlur={() => saveTileBackgroundDebounced.flush()}
              />
            </LabelledSettingsField>
          </StyledDimmable>
        )}
      </StyledSettingsSectionStack>
    </Section>
  );
};
