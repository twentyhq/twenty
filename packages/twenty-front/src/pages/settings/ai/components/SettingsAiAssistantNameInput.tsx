import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useId, useState } from 'react';
import {
  AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH,
  getAiChatAssistantProfileSchema,
  type AiChatAssistantProfile,
} from 'twenty-shared/ai';
import { AssistantAvatar } from 'twenty-ui/components/data-display';
import { Input } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

type SettingsAiAssistantNameInputProps = {
  value: AiChatAssistantProfile;
  onChange: (value: Pick<AiChatAssistantProfile, 'displayName'>) => void;
  disabled: boolean;
};

const ASSISTANT_PROFILE_SCHEMA = getAiChatAssistantProfileSchema();

const StyledNameRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledNameError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  padding: ${themeCssVariables.spacing[1]};
`;

export const SettingsAiAssistantNameInput = ({
  value,
  onChange,
  disabled,
}: SettingsAiAssistantNameInputProps) => {
  const { t } = useLingui();
  const nameErrorId = useId();
  const [nameInput, setNameInput] = useState({
    confirmedDisplayName: value.displayName,
    displayName: value.displayName,
  });

  if (nameInput.confirmedDisplayName !== value.displayName) {
    setNameInput({
      confirmedDisplayName: value.displayName,
      displayName: value.displayName,
    });
  }

  const parsedProfile = ASSISTANT_PROFILE_SCHEMA.safeParse({
    ...value,
    displayName: nameInput.displayName,
  });
  const isNameInvalid = !parsedProfile.success;

  return (
    <>
      <StyledNameRow>
        <AssistantAvatar
          shape={value.avatarShape}
          color={value.avatarColor}
          face={value.avatarFace}
          isAnimated={value.isAvatarAnimated}
          size={20}
        />
        <Input
          aria-label={t`Assistant name`}
          aria-invalid={isNameInvalid}
          aria-describedby={isNameInvalid ? nameErrorId : undefined}
          size="sm"
          value={nameInput.displayName}
          disabled={disabled}
          maxLength={AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH}
          onValueChange={(displayName) =>
            setNameInput((previousInput) => ({ ...previousInput, displayName }))
          }
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              event.currentTarget.blur();
            }
          }}
          onBlur={() => {
            if (!parsedProfile.success || disabled) {
              return;
            }

            setNameInput((previousInput) => ({
              ...previousInput,
              displayName: parsedProfile.data.displayName,
            }));

            if (parsedProfile.data.displayName !== value.displayName) {
              onChange({ displayName: parsedProfile.data.displayName });
            }
          }}
        />
      </StyledNameRow>
      {isNameInvalid && (
        <StyledNameError id={nameErrorId} role="alert">
          <Text size="sm">
            {t`Enter a name between 1 and ${AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH} characters on one line. Square brackets must be paired and cannot be nested.`}
          </Text>
        </StyledNameError>
      )}
    </>
  );
};
