import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Toast } from 'twenty-ui/components/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const ToastCountdownExample = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [closeCount, setCloseCount] = useState(0);

  return (
    <TwentyUiGalleryCard title="Toast countdown">
      <Button onClick={() => setIsVisible(true)}>
        Show timed notification
      </Button>
      {isVisible && (
        <Toast
          variant="success"
          duration={1200}
          onClose={() => {
            setCloseCount((count) => count + 1);
            setIsVisible(false);
          }}
        >
          Changes saved
        </Toast>
      )}
      <Text>Closed notifications: {closeCount}</Text>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'deedd53b-4e60-4a2c-abba-c80dd9c66ced',
  name: 'twenty-ui-toast-countdown',
  description: 'Toast countdown, hover pause and completion in the sandbox',
  component: ToastCountdownExample,
});
