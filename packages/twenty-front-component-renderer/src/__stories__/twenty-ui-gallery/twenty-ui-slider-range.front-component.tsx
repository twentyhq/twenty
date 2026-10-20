import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Slider } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const SliderRangeExample = () => {
  const [value, setValue] = useState<readonly number[]>([20, 80]);
  const [committedValue, setCommittedValue] = useState<readonly number[]>([
    20, 80,
  ]);

  return (
    <TwentyUiGalleryCard title="Slider range">
      <Slider.Root
        value={value}
        onValueChange={setValue}
        onValueCommitted={setCommittedValue}
      >
        <Slider.Label>Price range</Slider.Label>
        <Slider.Value />
        <Slider.Control data-testid="range-control">
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb index={0} aria-label="Minimum price" />
            <Slider.Thumb index={1} aria-label="Maximum price" />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
      <Text>
        Range: {value.join(', ')}; Committed range: {committedValue.join(', ')}
      </Text>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840013',
  name: 'twenty-ui-slider-range',
  description: 'Slider range thumb registration in the sandbox',
  component: SliderRangeExample,
});
