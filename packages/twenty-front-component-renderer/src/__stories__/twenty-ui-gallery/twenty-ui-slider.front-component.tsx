import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Slider } from 'twenty-ui/input';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const SliderExample = () => {
  const [value, setValue] = useState(40);
  const [committedValue, setCommittedValue] = useState(40);

  return (
    <TwentyUiGalleryCard title="Slider">
      <Slider.Root
        value={value}
        min={10}
        max={90}
        step={5}
        onValueChange={setValue}
        onValueCommitted={setCommittedValue}
      >
        <Slider.Label>Volume</Slider.Label>
        <Slider.Value />
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
      <Slider.Root aria-label="Disabled volume" defaultValue={30} disabled>
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb aria-label="Disabled volume" />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
      <p role="status">
        Volume: {value}; Committed: {committedValue}
      </p>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840012',
  name: 'twenty-ui-slider',
  description: 'Slider compound parts and value callbacks in the sandbox',
  component: SliderExample,
});
