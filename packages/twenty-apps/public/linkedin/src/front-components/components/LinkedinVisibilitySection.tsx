import { t } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components/layout';

import { LinkedinVisibilityIcon } from 'src/front-components/components/LinkedinVisibilityIcon';
import { SettingsRadioCard } from 'src/front-components/components/SettingsRadioCard';
import { type LinkedinVisibility } from 'src/types/linkedin-visibility.type';

type LinkedinVisibilitySectionProps = {
  visibility: LinkedinVisibility;
  onChange: (visibility: LinkedinVisibility) => void;
};

export const LinkedinVisibilitySection = ({
  visibility,
  onChange,
}: LinkedinVisibilitySectionProps) => (
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
          cardMedia: <LinkedinVisibilityIcon isBodyActive />,
          title: t('Everything'),
          description: t(
            'Messages and attachments will be shared with your team.',
          ),
        },
        {
          value: 'METADATA',
          cardMedia: <LinkedinVisibilityIcon isBodyActive={false} />,
          title: t('Metadata'),
          description: t(
            'Timestamp and participants will be shared with your team.',
          ),
        },
      ]}
    />
  </Section.Root>
);
