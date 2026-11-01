import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { openCommandConfirmationModal } from 'twenty-sdk/front-component';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const DialogExample = () => {
  const [status, setStatus] = useState('idle');

  const handleRequestConfirmation = async () => {
    setStatus('requested');
    const result = await openCommandConfirmationModal({
      title: 'Update account',
      subtitle: 'Confirm the account changes.',
      confirmButtonText: 'Update',
    });
    setStatus(result);
  };

  return (
    <TwentyUiGalleryCard title="Host dialog">
      <Text>Front components request dialogs through the SDK host API.</Text>
      <Button
        onClick={handleRequestConfirmation}
        disabled={status === 'requested'}
      >
        Update account
      </Button>
      <Text role="status">Confirmation: {status}</Text>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000111',
  name: 'twenty-ui-dialog',
  description: 'Requests a host-owned confirmation through the SDK dialog API',
  component: DialogExample,
});
