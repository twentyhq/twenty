import { useLingui } from '@lingui/react/macro';
import {
  DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
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
import { Switch } from 'twenty-ui/primitives/input';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { SettingsAiAssistantNameInput } from '~/pages/settings/ai/components/SettingsAiAssistantNameInput';
import { SettingsAiAssistantAvatarMenuPage } from '~/pages/settings/ai/components/SettingsAiAssistantAvatarMenuPage';
import { SETTINGS_AI_ASSISTANT_COLOR_LABELS } from '~/pages/settings/ai/constants/SettingsAiAssistantColorLabels';
import { SETTINGS_AI_ASSISTANT_FACE_LABELS } from '~/pages/settings/ai/constants/SettingsAiAssistantFaceLabels';
import { SETTINGS_AI_ASSISTANT_SHAPE_LABELS } from '~/pages/settings/ai/constants/SettingsAiAssistantShapeLabels';

type SettingsAiAssistantCustomizeMenuProps = {
  value: AiChatAssistantProfile;
  onChange: (value: Partial<AiChatAssistantProfile>) => void;
  disabled: boolean;
};

export const SettingsAiAssistantCustomizeMenu = ({
  value,
  onChange,
  disabled,
}: SettingsAiAssistantCustomizeMenuProps) => {
  const { t } = useLingui();

  return (
    <>
      <Dropdown.Page id="root">
        <Dropdown.Section>
          <SettingsAiAssistantNameInput
            key={value.displayName}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        </Dropdown.Section>
        <Dropdown.Separator />
        <Dropdown.Section>
          <Dropdown.ActionItem
            page="avatarShape"
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
                  onChange({ isAvatarAnimated })
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
