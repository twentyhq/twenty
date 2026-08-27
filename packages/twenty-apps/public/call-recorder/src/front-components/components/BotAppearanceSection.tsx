import { isUndefined } from '@sniptt/guards';
import { useId, useState } from 'react';
import { Section } from 'twenty-ui/layout';
import { Card } from 'twenty-ui/surfaces';
import { type ThemeColor } from 'twenty-ui/theme';
import { H2Title } from 'twenty-ui/typography';

import { AdornedHexInput } from 'src/front-components/components/AdornedHexInput';
import { LabelledSettingsField } from 'src/front-components/components/LabelledSettingsField';
import { SettingsOptionCardContentSelect } from 'src/front-components/components/SettingsOptionCardContentSelect';
import { SettingsOptionCardContentToggle } from 'src/front-components/components/SettingsOptionCardContentToggle';
import { StyledDimmable } from 'src/front-components/components/StyledDimmable';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { TileBackgroundControl } from 'src/front-components/components/TileBackgroundControl';
import {
  CALL_RECORDER_TILE_BACKGROUND_ROW,
  CALL_RECORDER_USE_WORKSPACE_LOGO_ROW,
} from 'src/front-components/constants/call-recorder-settings-layout.constant';
import { THEME_COLOR_HEX } from 'src/front-components/constants/theme-color-hex.constant';
import { useDebouncedSaveApplicationVariable } from 'src/front-components/hooks/use-debounced-save-application-variable';
import { useSaveApplicationVariable } from 'src/front-components/hooks/use-save-application-variable';
import { type CallRecorderApplicationVariable } from 'src/front-components/types/call-recorder-application-variable.type';
import { getApplicationVariableValue } from 'src/front-components/utils/get-application-variable-value.util';
import { getNormalizedHexValue } from 'src/front-components/utils/get-normalized-hex-value.util';
import { getThemeColorFromHex } from 'src/front-components/utils/get-theme-color-from-hex.util';
import { normalizeHexColor } from 'src/front-components/utils/normalize-hex-color.util';
import { DEFAULT_CALL_RECORDER_BOT_IMAGE_BACKGROUND } from 'src/logic-functions/constants/default-call-recorder-bot-image-background';

type BotAppearanceSectionProps = {
  applicationId: string;
  applicationVariables: Pick<
    CallRecorderApplicationVariable,
    'key' | 'value'
  >[];
};

export const BotAppearanceSection = ({
  applicationId,
  applicationVariables,
}: BotAppearanceSectionProps) => {
  const inputId = useId();
  const [isWorkspaceLogoEnabled, setIsWorkspaceLogoEnabled] = useState(
    () =>
      getApplicationVariableValue({
        applicationVariables,
        variableKey: CALL_RECORDER_USE_WORKSPACE_LOGO_ROW.variableKey,
      }) === 'true',
  );
  const [tileBackgroundValue, setTileBackgroundValue] = useState(() =>
    getApplicationVariableValue({
      applicationVariables,
      variableKey: CALL_RECORDER_TILE_BACKGROUND_ROW.variableKey,
    }),
  );
  const [isCustomHexOverride, setIsCustomHexOverride] = useState<
    boolean | undefined
  >(undefined);

  const { saveApplicationVariable } = useSaveApplicationVariable(applicationId);
  const { saveDebounced } = useDebouncedSaveApplicationVariable({
    applicationId,
    variableKey: CALL_RECORDER_TILE_BACKGROUND_ROW.variableKey,
  });

  const selectedTileColor = getThemeColorFromHex(tileBackgroundValue);
  const isCustomHexSelected =
    isCustomHexOverride ?? isUndefined(selectedTileColor);
  const swatchColor =
    normalizeHexColor(tileBackgroundValue) ??
    DEFAULT_CALL_RECORDER_BOT_IMAGE_BACKGROUND;

  const handleWorkspaceLogoChange = (checked: boolean) => {
    setIsWorkspaceLogoEnabled(checked);
    saveApplicationVariable({
      variableKey: CALL_RECORDER_USE_WORKSPACE_LOGO_ROW.variableKey,
      value: checked ? 'true' : 'false',
    });
  };

  const handleSelectTileColor = (color: ThemeColor) => {
    // a pending custom-hex save would overwrite the picked colour 250ms later
    saveDebounced.cancel();
    setIsCustomHexOverride(false);
    setTileBackgroundValue(THEME_COLOR_HEX[color]);
    saveApplicationVariable({
      variableKey: CALL_RECORDER_TILE_BACKGROUND_ROW.variableKey,
      value: THEME_COLOR_HEX[color],
    });
  };

  const handleHexChange = (value: string) => {
    setTileBackgroundValue(value);

    const valueToSave = getNormalizedHexValue(value);

    if (isUndefined(valueToSave)) {
      saveDebounced.cancel();
      return;
    }

    saveDebounced(valueToSave);
  };

  return (
    <Section>
      <H2Title
        title="Bot appearance"
        description="What participants see on the recorder's camera tile."
      />
      <StyledSettingsSectionStack>
        <Card rounded fullWidth>
          <SettingsOptionCardContentToggle
            Icon={CALL_RECORDER_USE_WORKSPACE_LOGO_ROW.Icon}
            title={CALL_RECORDER_USE_WORKSPACE_LOGO_ROW.title}
            description={CALL_RECORDER_USE_WORKSPACE_LOGO_ROW.description}
            divider
            checked={isWorkspaceLogoEnabled}
            onChange={handleWorkspaceLogoChange}
          />
          <StyledDimmable $dimmed={!isWorkspaceLogoEnabled}>
            <SettingsOptionCardContentSelect
              Icon={CALL_RECORDER_TILE_BACKGROUND_ROW.Icon}
              title={CALL_RECORDER_TILE_BACKGROUND_ROW.title}
              description={CALL_RECORDER_TILE_BACKGROUND_ROW.description}
            >
              <TileBackgroundControl
                swatchColor={swatchColor}
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
              inputId={inputId}
              hint="Six-digit hex, for example #1d1d1d."
              errorMessage={
                isUndefined(getNormalizedHexValue(tileBackgroundValue))
                  ? 'Invalid hex colour'
                  : undefined
              }
            >
              <AdornedHexInput
                id={inputId}
                value={tileBackgroundValue}
                swatchColor={swatchColor}
                onChange={handleHexChange}
                onBlur={() => saveDebounced.flush()}
              />
            </LabelledSettingsField>
          </StyledDimmable>
        )}
      </StyledSettingsSectionStack>
    </Section>
  );
};
