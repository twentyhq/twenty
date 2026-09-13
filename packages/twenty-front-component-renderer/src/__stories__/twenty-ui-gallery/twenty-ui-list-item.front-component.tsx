import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { ListItem } from 'twenty-ui/navigation';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const ListItemExample = () => {
  const [selected, setSelected] = useState(false);

  return (
    <TwentyUiGalleryCard title="ListItem">
      <ListItem
        selected={selected}
        indicator="check"
        onClick={() => setSelected(!selected)}
        description="Workspace preference"
      >
        Weekly digest
      </ListItem>
      <ListItem disabled role="button" onClick={() => setSelected(true)}>
        Disabled preference
      </ListItem>
      <p role="status">Digest: {selected ? 'enabled' : 'disabled'}</p>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840003',
  name: 'twenty-ui-list-item',
  description: 'ListItem selection and disabled behavior in the sandbox',
  component: ListItemExample,
});
