import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components/layout';
import { IconUsers } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { LinkedinImportPolicyIcon } from 'src/front-components/components/LinkedinImportPolicyIcon';
import { LinkedinSyncButton } from 'src/front-components/components/LinkedinSyncButton';
import { SettingsOptionCardContentToggle } from 'src/front-components/components/SettingsOptionCardContentToggle';
import { SettingsRadioCard } from 'src/front-components/components/SettingsRadioCard';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';
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
  historyImport: LinkedinHistoryImportState | null;
  syncProgress: number | undefined;
  isSyncStarting: boolean;
  isSyncCancelling: boolean;
  onChange: (importPolicy: LinkedinImportPolicy) => void;
  onGroupChatsImportChange: (areGroupChatsImported: boolean) => void;
  onSync: () => void;
  onCancelSync: () => void;
};

export const LinkedinImportSection = ({
  importPolicy,
  areGroupChatsImported,
  historyImport,
  syncProgress,
  isSyncStarting,
  isSyncCancelling,
  onChange,
  onGroupChatsImportChange,
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
        />
      </StyledSettingsCard>
      <LinkedinSyncButton
        historyImport={historyImport}
        progress={syncProgress}
        isStarting={isSyncStarting}
        isCancelling={isSyncCancelling}
        onSync={onSync}
        onCancel={onCancelSync}
      />
    </StyledStack>
  </Section.Root>
);
