import { openCommandConfirmationModal, t } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components';
import { IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

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
    <Section.Root>
      <Section.Header
        title={t('Danger zone')}
        description={t('Remove the API key and stop syncing notes')}
      />
      <Button
        startIcon={<IconTrash />}
        variant="outline"
        color="danger"
        disabled={isDisabled}
        onClick={handleDisconnectClick}
      >
        {t('Disconnect')}
      </Button>
    </Section.Root>
  );
};
