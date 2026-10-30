import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

import { LinkedinImportPolicyIcon } from 'src/front-components/components/LinkedinImportPolicyIcon';
import { LinkedinSyncButton } from 'src/front-components/components/LinkedinSyncButton';
import { SettingsRadioCard } from 'src/front-components/components/SettingsRadioCard';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';
import { type LinkedinImportPolicy } from 'src/types/linkedin-import-policy.type';

const StyledStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
`;

type LinkedinImportSectionProps = {
  importPolicy: LinkedinImportPolicy;
  historyImport: LinkedinHistoryImportState | null;
  isSyncStarting: boolean;
  onChange: (importPolicy: LinkedinImportPolicy) => void;
  onSync: () => void;
};

export const LinkedinImportSection = ({
  importPolicy,
  historyImport,
  isSyncStarting,
  onChange,
  onSync,
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
      <LinkedinSyncButton
        historyImport={historyImport}
        isStarting={isSyncStarting}
        onSync={onSync}
      />
    </StyledStack>
  </Section.Root>
);
