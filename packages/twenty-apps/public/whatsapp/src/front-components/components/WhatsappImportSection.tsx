import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

import { WhatsappChatPicker } from 'src/front-components/components/WhatsappChatPicker';
import { WhatsappImportPolicyIcon } from 'src/front-components/components/WhatsappImportPolicyIcon';
import { SettingsRadioCard } from 'src/front-components/components/SettingsRadioCard';
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
  onChange: (importPolicy: WhatsappImportPolicy) => void;
  onSelectedChatsChange: (selectedChats: WhatsappSelectedChat[]) => void;
};

export const WhatsappImportSection = ({
  importPolicy,
  selectedChats,
  onChange,
  onSelectedChatsChange,
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
    </StyledStack>
  </Section.Root>
);
