import { useLingui } from '@lingui/react/macro';
import { AssistantAvatar } from 'twenty-ui/components/data-display';
import { Dropdown } from 'twenty-ui/components/navigation';
import { ColorSample } from 'twenty-ui/primitives/data-display';
import { SETTINGS_AI_ASSISTANT_COLOR_LABELS } from '~/pages/settings/ai/constants/SettingsAiAssistantColorLabels';
import { SETTINGS_AI_ASSISTANT_FACE_LABELS } from '~/pages/settings/ai/constants/SettingsAiAssistantFaceLabels';
import { SETTINGS_AI_ASSISTANT_SHAPE_LABELS } from '~/pages/settings/ai/constants/SettingsAiAssistantShapeLabels';
import {
  AI_CHAT_ASSISTANT_AVATAR_COLORS,
  AI_CHAT_ASSISTANT_AVATAR_FACES,
  AI_CHAT_ASSISTANT_AVATAR_SHAPES,
  type AiChatAssistantProfile,
} from 'twenty-shared/ai';

type SettingsAiAssistantAvatarMenuPageProps = {
  attribute: 'avatarShape' | 'avatarColor' | 'avatarFace';
  title: string;
  value: AiChatAssistantProfile;
  onChange: (value: AiChatAssistantProfile) => void;
  disabled: boolean;
};

export const SettingsAiAssistantAvatarMenuPage = ({
  attribute,
  title,
  value,
  onChange,
  disabled,
}: SettingsAiAssistantAvatarMenuPageProps) => {
  const { t } = useLingui();
  const optionsByAttribute = {
    avatarShape: AI_CHAT_ASSISTANT_AVATAR_SHAPES.map((shape) => ({
      key: shape,
      label: t(SETTINGS_AI_ASSISTANT_SHAPE_LABELS[shape]),
      profile: { ...value, avatarShape: shape },
    })),
    avatarColor: AI_CHAT_ASSISTANT_AVATAR_COLORS.map((color) => ({
      key: color,
      label: t(SETTINGS_AI_ASSISTANT_COLOR_LABELS[color]),
      profile: { ...value, avatarColor: color },
    })),
    avatarFace: AI_CHAT_ASSISTANT_AVATAR_FACES.map((face) => ({
      key: face,
      label: t(SETTINGS_AI_ASSISTANT_FACE_LABELS[face]),
      profile: { ...value, avatarFace: face },
    })),
  };

  return (
    <Dropdown.Page id={attribute} type="menu">
      <Dropdown.Back aria-label={t`Back to customization`}>
        {title}
      </Dropdown.Back>
      <Dropdown.Section>
        {optionsByAttribute[attribute].map((option) => (
          <Dropdown.OptionItem
            key={option.key}
            selected={value[attribute] === option.key}
            disabled={disabled}
            closeOnSelect={false}
            onSelect={() => onChange(option.profile)}
            startIcon={
              attribute === 'avatarColor' ? (
                <ColorSample
                  colorName={option.profile.avatarColor}
                  variant="circle"
                />
              ) : (
                <AssistantAvatar
                  shape={option.profile.avatarShape}
                  color={option.profile.avatarColor}
                  face={option.profile.avatarFace}
                  size={16}
                />
              )
            }
          >
            {option.label}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
    </Dropdown.Page>
  );
};
