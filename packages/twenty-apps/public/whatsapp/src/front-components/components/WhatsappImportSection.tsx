import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconHistory, IconUsers } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { WHATSAPP_HISTORY_CONVERSATION_LIMITS } from 'src/constants/whatsapp-history-conversation-limits.constant';
import { WhatsappChatPicker } from 'src/front-components/components/WhatsappChatPicker';
import { WhatsappImportPolicyIcon } from 'src/front-components/components/WhatsappImportPolicyIcon';
import { WhatsappSyncButton } from 'src/front-components/components/WhatsappSyncButton';
import { SettingsOptionCardContentSegmentedControl } from 'src/front-components/components/SettingsOptionCardContentSegmentedControl';
import { SettingsOptionCardContentSwitch } from 'src/front-components/components/SettingsOptionCardContentSwitch';
import { SettingsRadioCard } from 'src/front-components/components/SettingsRadioCard';
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

type WhatsappImportSectionProps = {
  importPolicy: WhatsappImportPolicy;
  selectedChats: WhatsappSelectedChat[];
  areGroupChatsImported: boolean;
  historyConversationLimit: WhatsappHistoryConversationLimit;
  historyImport: WhatsappHistoryImportState | null;
  syncProgress: number | undefined;
  isSyncStarting: boolean;
  isSyncCancelling: boolean;
  onChange: (importPolicy: WhatsappImportPolicy) => void;
  onSelectedChatsChange: (selectedChats: WhatsappSelectedChat[]) => void;
  onGroupChatsImportChange: (areGroupChatsImported: boolean) => void;
  onHistoryConversationLimitChange: (
    historyConversationLimit: WhatsappHistoryConversationLimit,
  ) => void;
  onSync: () => void;
  onCancelSync: () => void;
};

export const WhatsappImportSection = ({
  importPolicy,
  selectedChats,
  areGroupChatsImported,
  historyConversationLimit,
  historyImport,
  syncProgress,
  isSyncStarting,
  isSyncCancelling,
  onChange,
  onSelectedChatsChange,
  onGroupChatsImportChange,
  onHistoryConversationLimitChange,
  onSync,
  onCancelSync,
}: WhatsappImportSectionProps) => (
  <Section.Root>
    <Section.Header
      title={t('Import')}
      description={t(
        'Choose which WhatsApp conversations are imported, past ones included.',
      )}
    />
    <StyledStack>
      <SettingsRadioCard
        value={importPolicy}
        onChange={onChange}
        options={[
          {
            value: 'ALL',
            cardMedia: <WhatsappImportPolicyIcon importPolicy="ALL" />,
            title: t('All chats'),
            description: t('Import every conversation'),
          },
          {
            value: 'CONTACTS_ONLY',
            cardMedia: (
              <WhatsappImportPolicyIcon importPolicy="CONTACTS_ONLY" />
            ),
            title: t('Contacts only'),
            description: t('Import chats with people already in Twenty'),
          },
          {
            value: 'SELECTED',
            cardMedia: <WhatsappImportPolicyIcon importPolicy="SELECTED" />,
            title: t('Selected chats'),
            description: t('Import only the conversations you pick'),
            cardContentExpanded: (
              <WhatsappChatPicker
                selectedChats={selectedChats}
                onChange={onSelectedChatsChange}
              />
            ),
          },
        ]}
      />
      {importPolicy !== 'SELECTED' && (
        <Card.Root fullWidth>
          <SettingsOptionCardContentSwitch
            Icon={IconUsers}
            title={t('Import group chats')}
            description={t('Groups where at least one member is a contact')}
            checked={areGroupChatsImported}
            onChange={onGroupChatsImportChange}
            divider
          />
          <SettingsOptionCardContentSegmentedControl
            Icon={IconHistory}
            title={t('Past conversations')}
            description={t('Most recent conversations imported on sync')}
            options={WHATSAPP_HISTORY_CONVERSATION_LIMITS.map((limit) => ({
              value: String(limit),
              label: limit === 0 ? t('None') : String(limit),
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
        </Card.Root>
      )}
      {(hasWhatsappHistoryToImport({
        importPolicy,
        selectedChats,
        historyConversationLimit,
      }) ||
        historyImport?.status === 'IMPORTING') && (
        <WhatsappSyncButton
          historyImport={historyImport}
          progress={syncProgress}
          isStarting={isSyncStarting}
          isCancelling={isSyncCancelling}
          onSync={onSync}
          onCancel={onCancelSync}
        />
      )}
    </StyledStack>
  </Section.Root>
);
