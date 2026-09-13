import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { CardPicker, Radio, RadioGroup } from 'twenty-ui/input';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const RadioGroupExample = () => {
  const [frequency, setFrequency] = useState('weekly');
  const [plan, setPlan] = useState('basic');

  return (
    <TwentyUiGalleryCard title="Radio group">
      <RadioGroup
        aria-label="Digest frequency"
        value={frequency}
        onValueChange={setFrequency}
      >
        <Radio value="daily">Daily</Radio>
        <Radio value="weekly">Weekly</Radio>
        <Radio value="monthly" disabled>
          Monthly
        </Radio>
      </RadioGroup>
      <p>Frequency: {frequency}</p>
      <RadioGroup
        aria-label="Plan"
        defaultValue="basic"
        onValueChange={setPlan}
      >
        <CardPicker value="basic">Basic plan</CardPicker>
        <CardPicker value="pro">Pro plan</CardPicker>
      </RadioGroup>
      <p>Plan: {plan}</p>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840014',
  name: 'twenty-ui-radio-group',
  description: 'RadioGroup selection with Radio and CardPicker in the sandbox',
  component: RadioGroupExample,
});
