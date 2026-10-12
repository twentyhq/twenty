import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Text } from 'twenty-ui/primitives/typography';
import { Button, Slider } from 'twenty-ui/primitives/input';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const SliderExample = () => {
  const [value, setValue] = useState(40);
  const [committedValue, setCommittedValue] = useState(40);
  const [isVolumeDisabled, setIsVolumeDisabled] = useState(false);
  const [isVolumeVisible, setIsVolumeVisible] = useState(true);
  const [isVolumeScaled, setIsVolumeScaled] = useState(false);
  const [parentPointerDownCount, setParentPointerDownCount] = useState(0);
  const [parentActionCount, setParentActionCount] = useState(0);

  const handleParentAction = () => {
    setParentActionCount((count) => count + 1);
  };

  const handleParentPointerDown = () => {
    setParentPointerDownCount((count) => count + 1);
  };

  return (
    <TwentyUiGalleryCard title="Slider">
      {isVolumeVisible && (
        <div
          data-testid="volume-pointer-parent"
          onPointerDown={handleParentPointerDown}
        >
          <Slider.Root
            disabled={isVolumeDisabled}
            style={
              isVolumeScaled
                ? { transform: 'scale(0.75)', transformOrigin: 'left center' }
                : undefined
            }
            value={value}
            min={10}
            max={90}
            step={5}
            onValueChange={setValue}
            onValueCommitted={setCommittedValue}
          >
            <Slider.Label>Volume</Slider.Label>
            <Slider.Value />
            <Slider.Control data-testid="volume-control">
              <Slider.Track>
                <Slider.Indicator />
                <Slider.Thumb />
              </Slider.Track>
            </Slider.Control>
          </Slider.Root>
          <Button onClick={handleParentAction}>Parent action</Button>
        </div>
      )}
      <Button onClick={() => setIsVolumeDisabled(true)}>Disable volume</Button>
      <Button onClick={() => setIsVolumeVisible(false)}>Hide volume</Button>
      <Button onClick={() => setIsVolumeScaled(true)}>Scale volume</Button>
      <Slider.Root aria-label="Disabled volume" defaultValue={30} disabled>
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb aria-label="Disabled volume" />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
      <Text role="status">
        Volume: {value}; Committed: {committedValue}
      </Text>
      <Text role="status">Parent presses: {parentPointerDownCount}</Text>
      <Text role="status">Parent actions: {parentActionCount}</Text>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840012',
  name: 'twenty-ui-slider',
  description: 'Slider compound parts and value callbacks in the sandbox',
  component: SliderExample,
});
