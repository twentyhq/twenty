import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { StyledSettingsSelectGroup } from '@/settings/components/SettingsOptions/StyledSettingsSelectGroup';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';
import { Section } from 'twenty-ui/components/layout';
import { IconInbox, IconMessage } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { Banner } from 'twenty-ui/primitives/feedback';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { SettingsAiBehaviorModeSelect } from '~/pages/settings/ai/components/SettingsAiBehaviorModeSelect';
import { type AiChatAssistantMode } from '~/generated-metadata/graphql';

type SettingsAiBehaviorSectionProps = {
  directMessageMode: AiChatAssistantMode | null;
  inboxMode: AiChatAssistantMode | null;
  onDirectMessageModeChange: (value: AiChatAssistantMode) => void;
  onInboxModeChange: (value: AiChatAssistantMode) => void;
  isLoading?: boolean;
  disabled?: boolean;
  errorMessage?: string;
};

export const SettingsAiBehaviorSection = ({
  directMessageMode,
  inboxMode,
  onDirectMessageModeChange,
  onInboxModeChange,
  isLoading = false,
  disabled = false,
  errorMessage,
}: SettingsAiBehaviorSectionProps) => {
  const sectionId = useId();
  const directMessagesLabelId = `${sectionId}-direct-messages`;
  const inboxLabelId = `${sectionId}-inbox`;
  const helperId = `${sectionId}-helper`;
  const errorId = `${sectionId}-error`;
  const hasError = isNonEmptyString(errorMessage);
  const isDisabled = disabled || isLoading;
  const describedBy = hasError ? `${helperId} ${errorId}` : helperId;

  return (
    <Section.Root aria-busy={isLoading}>
      <Section.Header
        title={t`Behavior`}
        description={t`Choose when Ada participates in conversations across your workspace`}
      />
      <Card.Root backgroundColor={themeCssVariables.background.secondary}>
        <StyledSettingsSelectGroup controlWidth={180}>
          <SettingsOptionCardContentSelect
            Icon={IconMessage}
            title={<span id={directMessagesLabelId}>{t`DMs`}</span>}
            description={t`One-to-one conversations between people`}
            divider
          >
            <SettingsAiBehaviorModeSelect
              value={directMessageMode}
              onChange={onDirectMessageModeChange}
              labelledBy={directMessagesLabelId}
              describedBy={describedBy}
              disabled={isDisabled}
              isLoading={isLoading}
              hasError={hasError}
            />
          </SettingsOptionCardContentSelect>
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
              hasError={hasError}
            />
          </SettingsOptionCardContentSelect>
        </StyledSettingsSelectGroup>
      </Card.Root>
      <Text id={helperId} size="sm" color="tertiary">
        {t`Never keeps Ada out. Only when mentioned asks Ada to reply when tagged. Auto lets Ada decide when to reply. Chats with only you and Ada always get replies.`}
      </Text>
      {isLoading && (
        <Text role="status" size="sm" color="tertiary">
          {t`Loading behavior settings...`}
        </Text>
      )}
      {hasError && (
        <Banner id={errorId} role="alert" status="error">
          {errorMessage}
        </Banner>
      )}
    </Section.Root>
  );
};
