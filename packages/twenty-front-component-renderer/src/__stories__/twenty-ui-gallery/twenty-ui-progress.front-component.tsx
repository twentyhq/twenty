import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { MetricRow } from 'twenty-ui/components/data-display';
import { IconDatabase } from 'twenty-ui/icon';
import { ProgressRing } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const ProgressExample = () => {
  const [progress, setProgress] = useState(25);

  return (
    <TwentyUiGalleryCard title="Determinate progress">
      <ProgressRing
        value={progress}
        aria-label="Importing records"
        aria-valuetext={`${progress} of 100 records`}
      >
        {progress} / 100
      </ProgressRing>
      <MetricRow
        startIcon={<IconDatabase size={14} />}
        value={<Text render={<bdi />}>{progress} / 100 GB</Text>}
        progress={progress}
        progressValueText={`${progress} of 100 gigabytes used`}
      >
        <Text render={<strong />}>Storage</Text>
      </MetricRow>
      <MetricRow value={0}>Completed imports</MetricRow>
      <ProgressRing value={-10} size="sm" aria-label="Empty progress" />
      <ProgressRing value={120} size="sm" aria-label="Complete progress" />
      <Button onClick={() => setProgress(75)}>Advance progress</Button>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'bdc37e74-31d3-4a94-9805-03bd38f40ddf',
  name: 'twenty-ui-progress',
  description:
    'Controlled progress, formatted metric values and accessible names in the sandbox',
  component: ProgressExample,
});
