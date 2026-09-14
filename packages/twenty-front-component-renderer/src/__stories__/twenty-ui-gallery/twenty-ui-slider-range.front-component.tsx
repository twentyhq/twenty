import { defineFrontComponent } from 'twenty-sdk/define';
import { Slider } from 'twenty-ui/input';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const SliderRangeExample = () => (
  <TwentyUiGalleryCard title="Slider range">
    <Slider.Root defaultValue={[20, 80]}>
      <Slider.Label>Price range</Slider.Label>
      <Slider.Value />
      <Slider.Control>
        <Slider.Track>
          <Slider.Indicator />
          <Slider.Thumb index={0} aria-label="Minimum price" />
          <Slider.Thumb index={1} aria-label="Maximum price" />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  </TwentyUiGalleryCard>
);

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840013',
  name: 'twenty-ui-slider-range',
  description: 'Slider range thumb registration in the sandbox',
  component: SliderRangeExample,
});
