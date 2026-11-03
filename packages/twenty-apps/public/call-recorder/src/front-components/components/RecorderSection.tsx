import styled from '@emotion/styled';
import { useId, useState } from 'react';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

import { CameraTilePreview } from 'src/front-components/components/CameraTilePreview';
import {
  CameraTileStylePicker,
  getCameraTileStyleOptionId,
} from 'src/front-components/components/CameraTileStylePicker';
import { LabelledSettingsField } from 'src/front-components/components/LabelledSettingsField';
import { SettingsOptionCardContentToggle } from 'src/front-components/components/SettingsOptionCardContentToggle';
import { StyledDimmable } from 'src/front-components/components/StyledDimmable';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { StyledSettingsTextInput } from 'src/front-components/components/StyledSettingsTextInput';
import {
  CALL_RECORDER_NAME_FIELD,
  CALL_RECORDER_NOTES_BY_TWENTY_ROW,
  CALL_RECORDER_STYLE_DESCRIPTIONS,
  CALL_RECORDER_STYLE_FIELD,
} from 'src/front-components/constants/call-recorder-settings-layout.constant';
import { useAutosaveApplicationVariable } from 'src/front-components/hooks/use-autosave-application-variable';
import { useWorkspaceBranding } from 'src/front-components/hooks/use-workspace-branding';
import { getApplicationVariableValue } from 'src/front-components/utils/get-application-variable-value.util';
import { DEFAULT_CALL_RECORDER_STYLE } from 'src/logic-functions/constants/default-call-recorder-style';
import { type CallRecorderStyle } from 'src/logic-functions/types/call-recorder-style.type';
import { isCallRecorderStyle } from 'src/logic-functions/utils/is-call-recorder-style.util';

const StyledPreview = styled.figure`
  background-color: ${() => themeCssVariables.background.secondary};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
  margin: 0;
  padding: ${() => themeCssVariables.spacing[2]};
`;

const StyledPreviewFrame = styled.div`
  border-radius: ${() => themeCssVariables.border.radius.sm};
  overflow: hidden;
`;

const StyledPreviewCaption = styled.figcaption`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-size: ${() => themeCssVariables.font.size.sm};
  text-align: center;
`;

const getInitialStyle = (): CallRecorderStyle => {
  const value = getApplicationVariableValue(
    CALL_RECORDER_STYLE_FIELD.variableKey,
  );

  return isCallRecorderStyle(value) ? value : DEFAULT_CALL_RECORDER_STYLE;
};

export const RecorderSection = () => {
  const nameInputId = useId();
  const styleIdPrefix = useId();
  const [nameValue, setNameValue] = useState(() =>
    getApplicationVariableValue(CALL_RECORDER_NAME_FIELD.variableKey),
  );
  const [style, setStyle] = useState(getInitialStyle);
  const [isNotesByTwentyEnabled, setIsNotesByTwentyEnabled] = useState(
    () =>
      getApplicationVariableValue(
        CALL_RECORDER_NOTES_BY_TWENTY_ROW.variableKey,
      ) !== 'false',
  );
  const { logoUrl, displayName } = useWorkspaceBranding();

  const { saveDebounced: saveNameDebounced } = useAutosaveApplicationVariable({
    variableKey: CALL_RECORDER_NAME_FIELD.variableKey,
  });
  const { saveImmediately: saveStyleImmediately } =
    useAutosaveApplicationVariable({
      variableKey: CALL_RECORDER_STYLE_FIELD.variableKey,
    });
  const { saveImmediately: saveNotesByTwentyImmediately } =
    useAutosaveApplicationVariable({
      variableKey: CALL_RECORDER_NOTES_BY_TWENTY_ROW.variableKey,
    });

  const handleNameChange = (value: string) => {
    setNameValue(value);
    saveNameDebounced(value);
  };

  const handleStyleChange = (value: CallRecorderStyle) => {
    if (value === style) {
      return;
    }

    setStyle(value);
    saveStyleImmediately(value);
  };

  const handleNotesByTwentyChange = (checked: boolean) => {
    setIsNotesByTwentyEnabled(checked);
    saveNotesByTwentyImmediately(checked ? 'true' : 'false');
  };

  const isWorkspaceStyle = style === 'WORKSPACE';
  const previewProps = { logoUrl, displayName, isNotesByTwentyEnabled };

  return (
    <Section.Root>
      <Section.Header
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
        <LabelledSettingsField
          label={CALL_RECORDER_STYLE_FIELD.label}
          inputId={getCameraTileStyleOptionId(styleIdPrefix, style)}
          hint={`${CALL_RECORDER_STYLE_DESCRIPTIONS[style]} ${CALL_RECORDER_STYLE_FIELD.hint}`}
        >
          <CameraTileStylePicker
            idPrefix={styleIdPrefix}
            label={CALL_RECORDER_STYLE_FIELD.label}
            value={style}
            onChange={handleStyleChange}
            {...previewProps}
          />
        </LabelledSettingsField>
        <StyledPreview>
          <StyledPreviewFrame>
            <CameraTilePreview
              style={style}
              isRecording
              recorderName={nameValue}
              {...previewProps}
            />
          </StyledPreviewFrame>
          <StyledPreviewCaption>Preview</StyledPreviewCaption>
        </StyledPreview>
        <StyledDimmable $dimmed={!isWorkspaceStyle}>
          <StyledSettingsCard>
            <SettingsOptionCardContentToggle
              Icon={CALL_RECORDER_NOTES_BY_TWENTY_ROW.Icon}
              title={CALL_RECORDER_NOTES_BY_TWENTY_ROW.title}
              description={CALL_RECORDER_NOTES_BY_TWENTY_ROW.description}
              checked={isNotesByTwentyEnabled}
              disabled={!isWorkspaceStyle}
              onChange={handleNotesByTwentyChange}
            />
          </StyledSettingsCard>
        </StyledDimmable>
      </StyledSettingsSectionStack>
    </Section.Root>
  );
};
