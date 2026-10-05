import { openCommandConfirmationModal, t } from 'twenty-sdk/front-component';
import { IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';

type GranolaDangerZoneSectionProps = {
  isDisabled: boolean;
  onDisconnect: () => void;
};

export const GranolaDangerZoneSection = ({
  isDisabled,
  onDisconnect,
}: GranolaDangerZoneSectionProps) => {
  const handleDisconnectClick = async () => {
    const confirmationResult = await openCommandConfirmationModal({
      title: t('Disconnect Granola'),
      subtitle: t(
        'This removes the API key and stops live sync. Recordings already in Twenty are kept.',
      ),
      confirmButtonText: t('Disconnect'),
      confirmButtonAccent: 'danger',
    });

    if (confirmationResult !== 'confirm') {
      return;
    }

    onDisconnect();
  };

  return (
    <Section>
      <H2Title
        title={t('Danger zone')}
        description={t('Remove the API key and stop syncing notes')}
      />
      <Button
        Icon={IconTrash}
        title={t('Disconnect')}
        variant="secondary"
        accent="danger"
        disabled={isDisabled}
        onClick={handleDisconnectClick}
      />
    </Section>
  );
};
