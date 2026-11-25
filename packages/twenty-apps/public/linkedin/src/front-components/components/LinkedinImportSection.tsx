import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components/layout';
import { IconUsers } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { LinkedinChatPicker } from 'src/front-components/components/LinkedinChatPicker';
import { LinkedinImportPolicyIcon } from 'src/front-components/components/LinkedinImportPolicyIcon';
import { SettingsOptionCardContentToggle } from 'src/front-components/components/SettingsOptionCardContentToggle';
import { SettingsRadioCard } from 'src/front-components/components/SettingsRadioCard';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';
import { type LinkedinImportPolicy } from 'src/types/linkedin-import-policy.type';
import { type LinkedinSelectedChat } from 'src/types/linkedin-selected-chat.type';

const StyledStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[4]};
`;

type LinkedinImportSectionProps = {
  importPolicy: LinkedinImportPolicy;
  selectedChats: LinkedinSelectedChat[];
  areGroupChatsImported: boolean;
  onChange: (importPolicy: LinkedinImportPolicy) => void;
  onSelectedChatsChange: (selectedChats: LinkedinSelectedChat[]) => void;
  onGroupChatsImportChange: (areGroupChatsImported: boolean) => void;
};

export const LinkedinImportSection = ({
  importPolicy,
  selectedChats,
  areGroupChatsImported,
  onChange,
  onSelectedChatsChange,
  onGroupChatsImportChange,
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
          {
            value: 'SELECTED',
            cardMedia: <LinkedinImportPolicyIcon importPolicy="SELECTED" />,
            title: t('Selected chats'),
            description: t('Import only the conversations you pick'),
            cardContentExpanded: (
              <LinkedinChatPicker
                selectedChats={selectedChats}
                onChange={onSelectedChatsChange}
              />
            ),
          },
        ]}
      />
      {importPolicy !== 'SELECTED' && (
        <StyledSettingsCard>
          <SettingsOptionCardContentToggle
            Icon={IconUsers}
            title={t('Import group chats')}
            description={t('Groups where at least one member is a contact')}
            checked={areGroupChatsImported}
            onChange={onGroupChatsImportChange}
          />
        </StyledSettingsCard>
      )}
    </StyledStack>
  </Section.Root>
);
