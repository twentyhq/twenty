import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Toast } from 'twenty-ui/components/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const ToastCountdownExample = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [closeCount, setCloseCount] = useState(0);
  const [contentUpdateCount, setContentUpdateCount] = useState(0);
  const [duration, setDuration] = useState(1600);
  const [progress, setProgress] = useState<number>();

  return (
    <TwentyUiGalleryCard title="Toast countdown">
      <Button
        onClick={() => {
          setContentUpdateCount(0);
          setDuration(1600);
          setProgress(undefined);
          setIsVisible(true);
        }}
      >
        Show timed notification
      </Button>
      {isVisible && (
        <Toast
          status="success"
          duration={duration}
          progress={progress}
          onClose={() => {
            setCloseCount((count) => count + 1);
            setIsVisible(false);
          }}
        >
          Changes saved: update {contentUpdateCount}
        </Toast>
      )}
      <Button
        disabled={!isVisible}
        onClick={() => setContentUpdateCount((count) => count + 1)}
      >
        Update notification content
      </Button>
      <Button disabled={!isVisible} onClick={() => setDuration(0)}>
        Keep notification open
      </Button>
      <Button disabled={!isVisible} onClick={() => setProgress(25)}>
        Track progress
      </Button>
      <Button disabled={!isVisible} onClick={() => setDuration(800)}>
        Use short duration
      </Button>
      <Button disabled={!isVisible} onClick={() => setProgress(undefined)}>
        Finish progress
      </Button>
      <Text>Closed notifications: {closeCount}</Text>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'deedd53b-4e60-4a2c-abba-c80dd9c66ced',
  name: 'twenty-ui-toast-countdown',
  description:
    'Toast remaining time, persistence, progress and overlapping pauses in the sandbox',
  component: ToastCountdownExample,
});
