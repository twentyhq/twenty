import { AGENT_CHAT_ASSISTANT_NAME } from '@/ai/constants/AgentChatAssistantName';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { StyledSettingsSelectGroup } from '@/settings/components/SettingsOptions/StyledSettingsSelectGroup';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { IconAlertTriangle, IconInbox } from 'twenty-ui/icon';
import { VisuallyHidden } from 'twenty-ui/primitives/accessibility';
import { Card } from 'twenty-ui/primitives/surfaces';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { SettingsAiBehaviorModeSelect } from '~/pages/settings/ai/components/SettingsAiBehaviorModeSelect';
import { type AiChatAssistantMode } from '~/generated-metadata/graphql';
import { useLingui } from '@lingui/react/macro';

const BEHAVIOR_SELECT_CONTROL_WIDTH = 180;

type SettingsAiBehaviorSectionProps = {
  inboxMode: AiChatAssistantMode | null;
  onInboxModeChange: (value: AiChatAssistantMode) => void;
  isLoading?: boolean;
  disabled?: boolean;
  errorMessage?: string;
};

const StyledBehaviorMessages = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

export const SettingsAiBehaviorSection = ({
  inboxMode,
  onInboxModeChange,
  isLoading = false,
  disabled = false,
  errorMessage,
}: SettingsAiBehaviorSectionProps) => {
  const { t } = useLingui();
  const sectionId = useId();
  const inboxLabelId = `${sectionId}-inbox`;
  const helperId = `${sectionId}-helper`;
  const errorId = `${sectionId}-error`;
  const hasError = isNonEmptyString(errorMessage);
  const isDisabled = disabled || isLoading;
  const describedBy = hasError ? `${helperId} ${errorId}` : helperId;
  const loadingMessage = isLoading ? t`Loading behavior settings...` : '';

  return (
    <Section.Root>
      <Section.Header
        title={t`Behavior`}
        description={t`Choose when ${AGENT_CHAT_ASSISTANT_NAME} participates in conversations across your workspace`}
      />
      <Card.Root
        backgroundColor={themeCssVariables.background.secondary}
        aria-busy={isLoading}
      >
        <StyledSettingsSelectGroup controlWidth={BEHAVIOR_SELECT_CONTROL_WIDTH}>
          <SettingsOptionCardContentSelect
            Icon={IconInbox}
            title={<span id={inboxLabelId}>{t`Global inbox`}</span>}
            description={t`Other inbox conversations`}
          >
            <SettingsAiBehaviorModeSelect
              value={inboxMode}
              onChange={onInboxModeChange}
              labelledBy={inboxLabelId}
              describedBy={describedBy}
              disabled={isDisabled}
              isLoading={isLoading}
            />
          </SettingsOptionCardContentSelect>
        </StyledSettingsSelectGroup>
      </Card.Root>
      <StyledBehaviorMessages>
        <Text id={helperId} size="sm" color="tertiary">
          {t`Never keeps ${AGENT_CHAT_ASSISTANT_NAME} out. Only when mentioned asks ${AGENT_CHAT_ASSISTANT_NAME} to reply when tagged. Auto lets ${AGENT_CHAT_ASSISTANT_NAME} decide when to reply. Chats with only you and ${AGENT_CHAT_ASSISTANT_NAME} always get replies.`}
        </Text>
        {isLoading && (
          <Text aria-hidden size="sm" color="tertiary">
            {loadingMessage}
          </Text>
        )}
        <VisuallyHidden role="status">{loadingMessage}</VisuallyHidden>
        {hasError && (
          <InlineBanner
            id={errorId}
            role="alert"
            status="error"
            icon={<IconAlertTriangle aria-hidden="true" />}
            embedded
          >
            <>{errorMessage}</>
          </InlineBanner>
        )}
      </StyledBehaviorMessages>
    </Section.Root>
  );
};
