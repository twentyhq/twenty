import { t } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components/layout';
import { IconBrandLinkedin, IconId } from 'twenty-ui/icon';

import { StyledSettingsCardIcon } from 'src/front-components/components/SettingsCardContentBase';
import { SettingsOptionIconCustomizer } from 'src/front-components/components/SettingsOptionIconCustomizer';
import { SettingsRadioCard } from 'src/front-components/components/SettingsRadioCard';

type LinkedinPeopleMatchingSectionProps = {
  isNameMatchingEnabled: boolean;
  onChange: (isNameMatchingEnabled: boolean) => void;
};

export const LinkedinPeopleMatchingSection = ({
  isNameMatchingEnabled,
  onChange,
}: LinkedinPeopleMatchingSectionProps) => (
  <Section.Root>
    <Section.Header
      title={t('People matching')}
      description={t('How Twenty finds the person behind a LinkedIn profile')}
    />
    <SettingsRadioCard
      value={isNameMatchingEnabled ? 'PROFILE_THEN_NAME' : 'PROFILE'}
      onChange={(value) => onChange(value === 'PROFILE_THEN_NAME')}
      options={[
        {
          value: 'PROFILE',
          cardMedia: (
            <StyledSettingsCardIcon>
              <SettingsOptionIconCustomizer Icon={IconBrandLinkedin} />
            </StyledSettingsCardIcon>
          ),
          title: t('LinkedIn profile'),
          description: t(
            'Match the profile against the LinkedIn field on People.',
          ),
        },
        {
          value: 'PROFILE_THEN_NAME',
          cardMedia: (
            <StyledSettingsCardIcon>
              <SettingsOptionIconCustomizer Icon={IconId} />
            </StyledSettingsCardIcon>
          ),
          title: t('LinkedIn profile, then name'),
          description: t(
            'Otherwise link the only person with the same first and last name.',
          ),
        },
      ]}
    />
  </Section.Root>
);
