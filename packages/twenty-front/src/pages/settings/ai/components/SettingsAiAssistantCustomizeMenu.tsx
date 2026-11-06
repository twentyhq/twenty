import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import {
  AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH,
  DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
  getAiChatAssistantProfileSchema,
  type AiChatAssistantProfile,
} from 'twenty-shared/ai';
import { AssistantAvatar } from 'twenty-ui/components/data-display';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  IconColorSwatch,
  IconHistory,
  IconMoodSmile,
  IconPlayerPlay,
} from 'twenty-ui/icon';
import { Input, Switch } from 'twenty-ui/primitives/input';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { SettingsAiAssistantAvatarMenuPage } from '~/pages/settings/ai/components/SettingsAiAssistantAvatarMenuPage';
import { SETTINGS_AI_ASSISTANT_COLOR_LABELS } from '~/pages/settings/ai/constants/SettingsAiAssistantColorLabels';
import { SETTINGS_AI_ASSISTANT_FACE_LABELS } from '~/pages/settings/ai/constants/SettingsAiAssistantFaceLabels';
import { SETTINGS_AI_ASSISTANT_SHAPE_LABELS } from '~/pages/settings/ai/constants/SettingsAiAssistantShapeLabels';

type SettingsAiAssistantCustomizeMenuProps = {
  value: AiChatAssistantProfile;
  onChange: (value: AiChatAssistantProfile) => void;
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

export const SettingsAiAssistantCustomizeMenu = ({
  value,
  onChange,
  disabled,
}: SettingsAiAssistantCustomizeMenuProps) => {
  const { t } = useLingui();
  const nameErrorId = useId();
  const parsedProfile = ASSISTANT_PROFILE_SCHEMA.safeParse(value);
  const isNameInvalid = !parsedProfile.success;

  return (
    <>
      <Dropdown.Page id="root">
        <Dropdown.Section>
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
              value={value.displayName}
              disabled={disabled}
              maxLength={AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH}
              onValueChange={(displayName) =>
                onChange({ ...value, displayName })
              }
              onBlur={() => {
                if (
                  parsedProfile.success &&
                  parsedProfile.data.displayName !== value.displayName
                ) {
                  onChange(parsedProfile.data);
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
        </Dropdown.Section>
        <Dropdown.Separator />
        <Dropdown.Section>
          <Dropdown.ActionItem
            page="avatarShape"
            disabled={disabled}
            startIcon={
              <AssistantAvatar
                shape={value.avatarShape}
                color={value.avatarColor}
                face={value.avatarFace}
                size={16}
              />
            }
            description={t(
              SETTINGS_AI_ASSISTANT_SHAPE_LABELS[value.avatarShape],
            )}
            descriptionPlacement="end"
          >
            {t`Shape`}
          </Dropdown.ActionItem>
          <Dropdown.ActionItem
            page="avatarColor"
            disabled={disabled}
            startIcon={<IconColorSwatch />}
            description={t(
              SETTINGS_AI_ASSISTANT_COLOR_LABELS[value.avatarColor],
            )}
            descriptionPlacement="end"
          >
            {t`Color`}
          </Dropdown.ActionItem>
          <Dropdown.ActionItem
            page="avatarFace"
            disabled={disabled}
            startIcon={<IconMoodSmile />}
            description={t(SETTINGS_AI_ASSISTANT_FACE_LABELS[value.avatarFace])}
            descriptionPlacement="end"
          >
            {t`Face`}
          </Dropdown.ActionItem>
        </Dropdown.Section>
        <Dropdown.Separator />
        <Dropdown.Section>
          <ListItem
            startIcon={<IconPlayerPlay />}
            endIcon={
              <Switch
                aria-label={t`Animate`}
                size="sm"
                checked={value.isAvatarAnimated}
                onCheckedChange={(isAvatarAnimated) =>
                  onChange({ ...value, isAvatarAnimated })
                }
                disabled={disabled}
              />
            }
          >
            {t`Animate`}
          </ListItem>
          <Dropdown.ActionItem
            disabled={disabled}
            startIcon={<IconHistory />}
            onClick={() => onChange(DEFAULT_AI_CHAT_ASSISTANT_PROFILE)}
          >
            {t`Reset to Ada`}
          </Dropdown.ActionItem>
        </Dropdown.Section>
      </Dropdown.Page>
      <SettingsAiAssistantAvatarMenuPage
        attribute="avatarShape"
        title={t`Shape`}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      <SettingsAiAssistantAvatarMenuPage
        attribute="avatarColor"
        title={t`Color`}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      <SettingsAiAssistantAvatarMenuPage
        attribute="avatarFace"
        title={t`Face`}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </>
  );
};
