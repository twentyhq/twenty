import { t } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components/layout';

import { LinkedinContactAutoCreationIcon } from 'src/front-components/components/LinkedinContactAutoCreationIcon';
import { SettingsRadioCard } from 'src/front-components/components/SettingsRadioCard';
import { type LinkedinContactAutoCreationPolicy } from 'src/types/linkedin-contact-auto-creation-policy.type';

type LinkedinContactAutoCreationSectionProps = {
  policy: LinkedinContactAutoCreationPolicy;
  onChange: (policy: LinkedinContactAutoCreationPolicy) => void;
};

export const LinkedinContactAutoCreationSection = ({
  policy,
  onChange,
}: LinkedinContactAutoCreationSectionProps) => (
  <Section.Root>
    <Section.Header
      title={t('Contact auto-creation')}
      description={t(
        'Automatically create People records when receiving or sending LinkedIn messages',
      )}
    />
    <SettingsRadioCard
      value={policy}
      onChange={onChange}
      options={[
        {
          value: 'SENT_AND_RECEIVED',
          cardMedia: (
            <LinkedinContactAutoCreationIcon isSentActive isReceivedActive />
          ),
          title: t('Sent and Received'),
          description: t('People I’ve messaged and received messages from.'),
        },
        {
          value: 'SENT',
          cardMedia: (
            <LinkedinContactAutoCreationIcon
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
            <LinkedinContactAutoCreationIcon
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
