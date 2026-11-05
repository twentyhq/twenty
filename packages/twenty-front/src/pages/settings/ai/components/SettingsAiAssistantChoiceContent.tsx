import { styled } from '@linaria/react';
import { type AiChatAssistantProfile } from 'twenty-shared/ai';
import { AssistantAvatar } from 'twenty-ui/components/data-display';
import { IconPencil } from 'twenty-ui/icon';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

type SettingsAiAssistantChoiceContentProps = {
  value: Pick<
    AiChatAssistantProfile,
    'avatarShape' | 'avatarColor' | 'avatarFace' | 'isAvatarAnimated'
  >;
  title: string;
  description: string;
  isCustomize?: boolean;
};

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  min-width: 0;
  width: 100%;
`;

const StyledPreview = styled.div`
  height: 40px;
  position: relative;
  width: 40px;
`;

const StyledEditBadge = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.rounded};
  bottom: calc(-1 * ${themeCssVariables.spacing[1]});
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  height: 18px;
  justify-content: center;
  position: absolute;
  right: calc(-1 * ${themeCssVariables.spacing[1]});
  width: 18px;
`;

const StyledLabels = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  max-width: 100%;
  text-align: center;
`;

const StyledTextLine = styled.div`
  text-box-edge: cap alphabetic;
  text-box-trim: trim-both;
`;

export const SettingsAiAssistantChoiceContent = ({
  value,
  title,
  description,
  isCustomize = false,
}: SettingsAiAssistantChoiceContentProps) => (
  <StyledContent>
    <StyledPreview>
      <AssistantAvatar
        shape={value.avatarShape}
        color={value.avatarColor}
        face={value.avatarFace}
        isAnimated={value.isAvatarAnimated}
        size={40}
      />
      {isCustomize && (
        <StyledEditBadge aria-hidden>
          <IconPencil size={12} />
        </StyledEditBadge>
      )}
    </StyledPreview>
    <StyledLabels>
      <Text
        render={<StyledTextLine />}
        size="md"
        color="primary"
        weight="medium"
      >
        {title}
      </Text>
      <Text render={<StyledTextLine />} size="sm" color="tertiary">
        {description}
      </Text>
    </StyledLabels>
  </StyledContent>
);
