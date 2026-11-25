import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components/layout';
import { IconUsers } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { WhatsappChatPicker } from 'src/front-components/components/WhatsappChatPicker';
import { WhatsappHistoryImportStatus } from 'src/front-components/components/WhatsappHistoryImportStatus';
import { WhatsappImportPolicyIcon } from 'src/front-components/components/WhatsappImportPolicyIcon';
import { SettingsOptionCardContentSwitch } from 'src/front-components/components/SettingsOptionCardContentSwitch';
import { SettingsRadioCard } from 'src/front-components/components/SettingsRadioCard';
import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';
import { type WhatsappImportPolicy } from 'src/types/whatsapp-import-policy.type';
import { type WhatsappSelectedChat } from 'src/types/whatsapp-selected-chat.type';

const StyledStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[4]};
`;

type WhatsappImportSectionProps = {
  importPolicy: WhatsappImportPolicy;
  selectedChats: WhatsappSelectedChat[];
  areGroupChatsImported: boolean;
  historyImport: WhatsappHistoryImportState | null;
  importProgress: number | undefined;
  isImportRetrying: boolean;
  isImportCancelling: boolean;
  onChange: (importPolicy: WhatsappImportPolicy) => void;
  onSelectedChatsChange: (selectedChats: WhatsappSelectedChat[]) => void;
  onGroupChatsImportChange: (areGroupChatsImported: boolean) => void;
  onRetryImport: () => void;
  onCancelImport: () => void;
};

export const WhatsappImportSection = ({
  importPolicy,
  selectedChats,
  areGroupChatsImported,
  historyImport,
  importProgress,
  isImportRetrying,
  isImportCancelling,
  onChange,
  onSelectedChatsChange,
  onGroupChatsImportChange,
  onRetryImport,
  onCancelImport,
}: WhatsappImportSectionProps) => (
  <Section.Root>
    <Section.Header
      title={t('Import')}
      description={t(
        'Your most recent conversations are imported right away, new messages as they arrive.',
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
          />
        </Card.Root>
      )}
      {(historyImport?.status === 'IMPORTING' ||
        historyImport?.status === 'FAILED') && (
        <WhatsappHistoryImportStatus
          historyImport={historyImport}
          progress={importProgress}
          isRetrying={isImportRetrying}
          isCancelling={isImportCancelling}
          onRetry={onRetryImport}
          onCancel={onCancelImport}
        />
      )}
    </StyledStack>
  </Section.Root>
);
