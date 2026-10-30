import { t } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components/layout';
import { IconCheck } from 'twenty-ui/icon';

import { SettingsOptionCardContentToggle } from 'src/front-components/components/SettingsOptionCardContentToggle';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';

// Disabled until Twenty tells apps when a member opens a conversation
export const LinkedinReadStatusSection = () => (
  <Section.Root>
    <Section.Header
      title={t('Read status')}
      description={t('Keep LinkedIn and Twenty in sync')}
    />
    <StyledSettingsCard>
      <SettingsOptionCardContentToggle
        Icon={IconCheck}
        title={t('Mark chats as read on LinkedIn')}
        description={t(
          'Coming soon: opening a chat in Twenty marks it as read on LinkedIn',
        )}
        disabled
        checked={false}
        onChange={() => undefined}
      />
    </StyledSettingsCard>
  </Section.Root>
);
