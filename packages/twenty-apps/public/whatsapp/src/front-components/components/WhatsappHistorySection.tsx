import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconHistory, IconListCheck } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { WHATSAPP_HISTORY_CONVERSATION_LIMITS } from 'src/constants/whatsapp-history-conversation-limits.constant';
import {
  StyledSettingsCardIcon,
  StyledSettingsCardRow,
  StyledSettingsCardTextContainer,
} from 'src/front-components/components/SettingsCardContentBase';
import { SettingsOptionCardContentSegmentedControl } from 'src/front-components/components/SettingsOptionCardContentSegmentedControl';
import { SettingsOptionIconCustomizer } from 'src/front-components/components/SettingsOptionIconCustomizer';
import { WhatsappHistoryImportButton } from 'src/front-components/components/WhatsappHistoryImportButton';
import { type WhatsappHistoryConversationLimit } from 'src/types/whatsapp-history-conversation-limit.type';
import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';
import { type WhatsappImportPolicy } from 'src/types/whatsapp-import-policy.type';
import { type WhatsappSelectedChat } from 'src/types/whatsapp-selected-chat.type';
import { hasWhatsappHistoryToImport } from 'src/utils/has-whatsapp-history-to-import.util';

const StyledStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[4]};
`;

type WhatsappHistorySectionProps = {
  importPolicy: WhatsappImportPolicy;
  selectedChats: WhatsappSelectedChat[];
  historyConversationLimit: WhatsappHistoryConversationLimit;
  historyImport: WhatsappHistoryImportState | null;
  importProgress: number | undefined;
  isImportStarting: boolean;
  isImportCancelling: boolean;
  onHistoryConversationLimitChange: (
    historyConversationLimit: WhatsappHistoryConversationLimit,
  ) => void;
  onImport: () => void;
  onCancelImport: () => void;
};

export const WhatsappHistorySection = ({
  importPolicy,
  selectedChats,
  historyConversationLimit,
  historyImport,
  importProgress,
  isImportStarting,
  isImportCancelling,
  onHistoryConversationLimitChange,
  onImport,
  onCancelImport,
}: WhatsappHistorySectionProps) => (
  <Section.Root>
    <Section.Header
      title={t('History')}
      description={t(
        'Import past WhatsApp conversations, as chosen in the Sync tab.',
      )}
    />
    <StyledStack>
      <Card.Root fullWidth>
        {importPolicy === 'SELECTED' ? (
          <Card.Content>
            <StyledSettingsCardRow>
              <StyledSettingsCardIcon>
                <SettingsOptionIconCustomizer Icon={IconListCheck} />
              </StyledSettingsCardIcon>
              <StyledSettingsCardTextContainer>
                <Text weight="medium" color="primary">
                  {t('Selected chats')}
                </Text>
                <Text size="sm" color="secondary">
                  {selectedChats.length > 0
                    ? t(
                        'Imports the conversations picked in the Sync tab ({count})',
                        { count: selectedChats.length },
                      )
                    : t('Pick conversations in the Sync tab to import them')}
                </Text>
              </StyledSettingsCardTextContainer>
            </StyledSettingsCardRow>
          </Card.Content>
        ) : (
          <SettingsOptionCardContentSegmentedControl
            Icon={IconHistory}
            title={t('Past conversations')}
            description={t('Most recent conversations to import')}
            options={WHATSAPP_HISTORY_CONVERSATION_LIMITS.map((limit) => ({
              value: String(limit),
              label: String(limit),
            }))}
            value={String(historyConversationLimit)}
            onChange={(value) => {
              const limit = WHATSAPP_HISTORY_CONVERSATION_LIMITS.find(
                (candidate) => String(candidate) === value,
              );

              if (isDefined(limit)) {
                onHistoryConversationLimitChange(limit);
              }
            }}
          />
        )}
      </Card.Root>
      {(hasWhatsappHistoryToImport({ importPolicy, selectedChats }) ||
        historyImport?.status === 'IMPORTING') && (
        <WhatsappHistoryImportButton
          historyImport={historyImport}
          progress={importProgress}
          isStarting={isImportStarting}
          isCancelling={isImportCancelling}
          onImport={onImport}
          onCancel={onCancelImport}
        />
      )}
    </StyledStack>
  </Section.Root>
);
