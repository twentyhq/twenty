import { t } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components/layout';

import { WhatsappContactAutoCreationIcon } from 'src/front-components/components/WhatsappContactAutoCreationIcon';
import { SettingsRadioCard } from 'src/front-components/components/SettingsRadioCard';
import { type WhatsappContactAutoCreationPolicy } from 'src/types/whatsapp-contact-auto-creation-policy.type';

type WhatsappContactAutoCreationSectionProps = {
  policy: WhatsappContactAutoCreationPolicy;
  onChange: (policy: WhatsappContactAutoCreationPolicy) => void;
};

export const WhatsappContactAutoCreationSection = ({
  policy,
  onChange,
}: WhatsappContactAutoCreationSectionProps) => (
  <Section.Root>
    <Section.Header
      title={t('Contact auto-creation')}
      description={t(
        'Automatically create People records for the phone numbers you chat with',
      )}
    />
    <SettingsRadioCard
      value={policy}
      onChange={onChange}
      options={[
        {
          value: 'SENT_AND_RECEIVED',
          cardMedia: (
            <WhatsappContactAutoCreationIcon isSentActive isReceivedActive />
          ),
          title: t('Sent and Received'),
          description: t('People I’ve messaged and received messages from.'),
        },
        {
          value: 'SENT',
          cardMedia: (
            <WhatsappContactAutoCreationIcon
              isSentActive
              isReceivedActive={false}
            />
          ),
          title: t('Sent'),
          description: t('People I’ve messaged.'),
        },
        {
          value: 'NONE',
          cardMedia: (
            <WhatsappContactAutoCreationIcon
              isSentActive={false}
              isReceivedActive={false}
            />
          ),
          title: t('None'),
          description: t('Don’t auto-create contacts.'),
        },
      ]}
    />
  </Section.Root>
);
