import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconHistory, IconUsers } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { LINKEDIN_HISTORY_CONVERSATION_LIMITS } from 'src/constants/linkedin-history-conversation-limits.constant';
import { LinkedinImportPolicyIcon } from 'src/front-components/components/LinkedinImportPolicyIcon';
import { LinkedinSyncButton } from 'src/front-components/components/LinkedinSyncButton';
import { SettingsOptionCardContentSegmentedControl } from 'src/front-components/components/SettingsOptionCardContentSegmentedControl';
import { SettingsOptionCardContentToggle } from 'src/front-components/components/SettingsOptionCardContentToggle';
import { SettingsRadioCard } from 'src/front-components/components/SettingsRadioCard';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';
import { type LinkedinHistoryConversationLimit } from 'src/types/linkedin-history-conversation-limit.type';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';
import { type LinkedinImportPolicy } from 'src/types/linkedin-import-policy.type';

const StyledStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[4]};
`;

type LinkedinImportSectionProps = {
  importPolicy: LinkedinImportPolicy;
  areGroupChatsImported: boolean;
  historyConversationLimit: LinkedinHistoryConversationLimit;
  historyImport: LinkedinHistoryImportState | null;
  syncProgress: number | undefined;
  isSyncStarting: boolean;
  isSyncCancelling: boolean;
  onChange: (importPolicy: LinkedinImportPolicy) => void;
  onGroupChatsImportChange: (areGroupChatsImported: boolean) => void;
  onHistoryConversationLimitChange: (
    historyConversationLimit: LinkedinHistoryConversationLimit,
  ) => void;
  onSync: () => void;
  onCancelSync: () => void;
};

export const LinkedinImportSection = ({
  importPolicy,
  areGroupChatsImported,
  historyConversationLimit,
  historyImport,
  syncProgress,
  isSyncStarting,
  isSyncCancelling,
  onChange,
  onGroupChatsImportChange,
  onHistoryConversationLimitChange,
  onSync,
  onCancelSync,
}: LinkedinImportSectionProps) => (
  <Section.Root>
    <Section.Header
      title={t('Import')}
      description={t(
        'Choose which LinkedIn conversations are imported, past ones included.',
      )}
    />
    <StyledStack>
      <SettingsRadioCard
        value={importPolicy}
        onChange={onChange}
        options={[
          {
            value: 'ALL',
            cardMedia: <LinkedinImportPolicyIcon importPolicy="ALL" />,
            title: t('All chats'),
            description: t('Import every conversation'),
          },
          {
            value: 'CONTACTS_ONLY',
            cardMedia: (
              <LinkedinImportPolicyIcon importPolicy="CONTACTS_ONLY" />
            ),
            title: t('Contacts only'),
            description: t('Import chats with people already in Twenty'),
          },
        ]}
      />
      <StyledSettingsCard>
        <SettingsOptionCardContentToggle
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
          options={LINKEDIN_HISTORY_CONVERSATION_LIMITS.map((limit) => ({
            value: String(limit),
            label: limit === 0 ? t('None') : String(limit),
          }))}
          value={String(historyConversationLimit)}
          onChange={(value) => {
            const limit = LINKEDIN_HISTORY_CONVERSATION_LIMITS.find(
              (candidate) => String(candidate) === value,
            );

            if (isDefined(limit)) {
              onHistoryConversationLimitChange(limit);
            }
          }}
        />
      </StyledSettingsCard>
      {(historyConversationLimit > 0 ||
        historyImport?.status === 'IMPORTING') && (
        <LinkedinSyncButton
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
