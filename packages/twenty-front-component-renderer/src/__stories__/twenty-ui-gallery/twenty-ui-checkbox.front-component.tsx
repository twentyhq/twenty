import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Checkbox } from 'twenty-ui/input';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const CheckboxExample = () => {
  const [checked, setChecked] = useState(false);
  const [changeCount, setChangeCount] = useState(0);

  return (
    <TwentyUiGalleryCard title="Checkbox">
      <Checkbox
        aria-label="Select account"
        checked={checked}
        onCheckedChange={(nextChecked) => {
          setChecked(nextChecked);
          setChangeCount((count) => count + 1);
        }}
      />
      <Checkbox aria-label="Uncontrolled selection" defaultChecked />
      <Checkbox aria-label="Partial selection" indeterminate />
      <Checkbox aria-label="Disabled selection" disabled />
      <Checkbox aria-label="Read-only selection" defaultChecked readOnly />
      <p role="status">
        Selection: {checked ? 'selected' : 'unselected'}; Changes: {changeCount}
      </p>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840011',
  name: 'twenty-ui-checkbox',
  description: 'Checkbox state and interaction behavior in the sandbox',
  component: CheckboxExample,
});
