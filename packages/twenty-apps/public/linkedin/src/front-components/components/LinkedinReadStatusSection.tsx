import { t } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components/layout';
import { IconCheck } from 'twenty-ui/icon';

import { SettingsOptionCardContentToggle } from 'src/front-components/components/SettingsOptionCardContentToggle';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';

type LinkedinReadStatusSectionProps = {
  areChatsMarkedAsRead: boolean;
  onChange: (areChatsMarkedAsRead: boolean) => void;
};

export const LinkedinReadStatusSection = ({
  areChatsMarkedAsRead,
  onChange,
}: LinkedinReadStatusSectionProps) => (
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
          'Opening a chat in Twenty marks it as read on LinkedIn, which can show the sender a read receipt',
        )}
        checked={areChatsMarkedAsRead}
        onChange={onChange}
      />
    </StyledSettingsCard>
  </Section.Root>
);
