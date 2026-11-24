import { t } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components/layout';

import { WhatsappVisibilityIcon } from 'src/front-components/components/WhatsappVisibilityIcon';
import { SettingsRadioCard } from 'src/front-components/components/SettingsRadioCard';
import { type WhatsappVisibility } from 'src/types/whatsapp-visibility.type';

type WhatsappVisibilitySectionProps = {
  visibility: WhatsappVisibility;
  onChange: (visibility: WhatsappVisibility) => void;
};

export const WhatsappVisibilitySection = ({
  visibility,
  onChange,
}: WhatsappVisibilitySectionProps) => (
  <Section.Root>
    <Section.Header
      title={t('Visibility')}
      description={t(
        'Specify which part of your conversations other users can see',
      )}
    />
    <SettingsRadioCard
      value={visibility}
      onChange={onChange}
      options={[
        {
          value: 'SHARE_EVERYTHING',
          cardMedia: <WhatsappVisibilityIcon isBodyActive />,
          title: t('Everything'),
          description: t(
            'Messages and attachments will be shared with your team.',
          ),
        },
        {
          value: 'METADATA',
          cardMedia: <WhatsappVisibilityIcon isBodyActive={false} />,
          title: t('Metadata'),
          description: t(
            'Timestamp and participants will be shared with your team.',
          ),
        },
      ]}
    />
  </Section.Root>
);
