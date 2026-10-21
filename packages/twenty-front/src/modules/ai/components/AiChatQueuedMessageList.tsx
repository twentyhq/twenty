import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useId, useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { LightIconButton } from 'twenty-ui/components/input';
import {
  IconChevronDown,
  IconChevronUp,
  IconCornerDownRight,
  IconTrash,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

const COLLAPSED_QUEUED_MESSAGE_COUNT = 3;

const StyledQueue = styled.div`
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-bottom: none;
  border-radius: ${themeCssVariables.border.radius.md}
    ${themeCssVariables.border.radius.md} 0 0;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  margin-inline: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]}
    ${themeCssVariables.spacing[1]};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-height: ${themeCssVariables.spacing[6]};
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledTitleContainer = styled.span`
  flex: 1;
`;

const StyledItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
`;

const StyledItem = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-height: ${themeCssVariables.spacing[8]};
  padding-inline: ${themeCssVariables.spacing[1]};

  &:hover,
  &:focus-within {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledIcon = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
`;

const StyledTextContainer = styled.span`
  flex: 1;
  min-width: 0;
`;

const StyledMoreButtonContainer = styled.div`
  display: flex;
  justify-content: flex-start;
`;

type AiChatQueuedMessageListProps = {
  messages: {
    id: string;
    text: string;
    isRemovable: boolean;
    sender?: { id: string; name: string; avatarUrl?: string };
  }[];
  onRemove?: (messageId: string) => void;
};

export const AiChatQueuedMessageList = ({
  messages,
  onRemove,
}: AiChatQueuedMessageListProps) => {
  const { t } = useLingui();
  const [isExpanded, setIsExpanded] = useState(false);
  const itemsId = useId();

  if (!isNonEmptyArray(messages)) {
    return null;
  }

  const remainingCount = messages.length - COLLAPSED_QUEUED_MESSAGE_COUNT;
  const visibleMessages = isExpanded
    ? messages
    : messages.slice(0, COLLAPSED_QUEUED_MESSAGE_COUNT);

  return (
    <StyledQueue aria-label={t`Queued messages`}>
      <StyledHeader>
        <Text
          render={<StyledTitleContainer />}
          size="md"
          weight="medium"
          color="primary"
        >
          {t`Queued`}
        </Text>
        <Text render={<span />} size="sm" color="light">
          {messages.length}
        </Text>
      </StyledHeader>
      <StyledItems id={itemsId}>
        {visibleMessages.map((message) => (
          <StyledItem key={message.id}>
            <StyledIcon>
              {isDefined(message.sender) ? (
                <Avatar
                  src={message.sender.avatarUrl}
                  colorSeed={message.sender.id}
                  name={message.sender.name}
                  size="sm"
                  shape="circle"
                />
              ) : (
                <IconCornerDownRight size={16} />
              )}
            </StyledIcon>
            <Text
              render={<StyledTextContainer />}
              size="md"
              color="secondary"
              truncate
              title={message.text}
            >
              {isDefined(message.sender) && `${message.sender.name} · `}
              {message.text}
            </Text>
            {message.isRemovable && isDefined(onRemove) && (
              <LightIconButton
                onClick={() => onRemove(message.id)}
                size="sm"
                aria-label={t`Remove queued message`}
              >
                <IconTrash />
              </LightIconButton>
            )}
          </StyledItem>
        ))}
      </StyledItems>
      {remainingCount > 0 && (
        <StyledMoreButtonContainer>
          <Button
            size="md"
            variant="ghost"
            color="neutral"
            startIcon={isExpanded ? <IconChevronUp /> : <IconChevronDown />}
            aria-controls={itemsId}
            aria-expanded={isExpanded}
            onClick={() =>
              setIsExpanded((previousIsExpanded) => !previousIsExpanded)
            }
          >
            {isExpanded ? t`Show less` : t`${remainingCount} more`}
          </Button>
        </StyledMoreButtonContainer>
      )}
    </StyledQueue>
  );
};
