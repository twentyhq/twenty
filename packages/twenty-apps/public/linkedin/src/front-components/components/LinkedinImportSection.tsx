import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

import { LinkedinChatPicker } from 'src/front-components/components/LinkedinChatPicker';
import { LinkedinImportPolicyIcon } from 'src/front-components/components/LinkedinImportPolicyIcon';
import { SettingsRadioCard } from 'src/front-components/components/SettingsRadioCard';
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
  onChange: (importPolicy: LinkedinImportPolicy) => void;
  onSelectedChatsChange: (selectedChats: LinkedinSelectedChat[]) => void;
};

export const LinkedinImportSection = ({
  importPolicy,
  selectedChats,
  onChange,
  onSelectedChatsChange,
}: LinkedinImportSectionProps) => (
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
    </StyledStack>
  </Section.Root>
);
