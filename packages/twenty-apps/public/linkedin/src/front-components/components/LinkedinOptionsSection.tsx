import { t } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components/layout';
import { IconUser, IconUsers } from 'twenty-ui/icon';

import { SettingsOptionCardContentToggle } from 'src/front-components/components/SettingsOptionCardContentToggle';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';

type LinkedinOptionsSectionProps = {
  isNameMatchingEnabled: boolean;
  areGroupConversationsExcluded: boolean;
  onNameMatchingChange: (isNameMatchingEnabled: boolean) => void;
  onGroupConversationsExclusionChange: (
    areGroupConversationsExcluded: boolean,
  ) => void;
};

export const LinkedinOptionsSection = ({
  isNameMatchingEnabled,
  areGroupConversationsExcluded,
  onNameMatchingChange,
  onGroupConversationsExclusionChange,
}: LinkedinOptionsSectionProps) => (
  <Section.Root>
    <Section.Header
      title={t('Options')}
      description={t(
        'Configure how LinkedIn participants are matched to People',
      )}
    />
    <StyledSettingsCard>
      <SettingsOptionCardContentToggle
        Icon={IconUser}
        title={t('Match by name')}
        description={t(
          'If no profile link matches, link the only person with the same name',
        )}
        divider
        checked={isNameMatchingEnabled}
        onChange={onNameMatchingChange}
      />
      <SettingsOptionCardContentToggle
        Icon={IconUsers}
        title={t('Exclude group conversations')}
        description={t(
          'Don’t import chats with more than one other participant',
        )}
        checked={areGroupConversationsExcluded}
        onChange={onGroupConversationsExclusionChange}
      />
    </StyledSettingsCard>
  </Section.Root>
);
