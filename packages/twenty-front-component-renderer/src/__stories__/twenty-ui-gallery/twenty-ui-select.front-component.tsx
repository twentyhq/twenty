import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Select } from 'twenty-ui/input';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const SelectExample = () => {
  const [value, setValue] = useState<string | null>('new');

  return (
    <TwentyUiGalleryCard title="Select">
      <Select.Root
        value={value}
        onValueChange={setValue}
        items={{ new: 'New', qualified: 'Qualified', archived: 'Archived' }}
      >
        <Select.Trigger aria-label="Account stage">
          <Select.Value />
        </Select.Trigger>
        <Select.Popup>
          <Select.Group>
            <Select.GroupLabel>Active stages</Select.GroupLabel>
            <Select.Item value="new">New</Select.Item>
            <Select.Item value="qualified">Qualified</Select.Item>
          </Select.Group>
          <Select.Separator />
          <Select.Item value="archived" disabled>
            Archived
          </Select.Item>
        </Select.Popup>
      </Select.Root>
      <p role="status">Stage: {value}</p>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840007',
  name: 'twenty-ui-select',
  description: 'Select controlled value and portal options in the sandbox',
  component: SelectExample,
});
