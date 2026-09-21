import { createElement, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Avatar, ColorSample, Tag } from 'twenty-ui/primitives/data-display';
import { ListItem } from 'twenty-ui/primitives/navigation';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const PickerListItemsExample = () => {
  const [assignee, setAssignee] = useState('');
  const [qualified, setQualified] = useState(false);
  const [changes, setChanges] = useState(0);

  return (
    <TwentyUiGalleryCard title="Picker rows">
      <div role="listbox" aria-label="Assignee">
        {['Alex Morgan', 'Sam Taylor'].map((name) => (
          <ListItem
            key={name}
            role="option"
            aria-label={name}
            aria-selected={assignee === name ? 'true' : 'false'}
            selected={assignee === name}
            indicator="check"
            startIcon={<Avatar name={name} size="md" />}
            description="Person"
            render={(props) =>
              createElement('button', { ...props, type: 'button' })
            }
            onClick={() => setAssignee(name)}
          >
            {name}
          </ListItem>
        ))}
      </div>
      <div role="listbox" aria-label="Tags" aria-multiselectable>
        <ListItem
          role="option"
          aria-selected={qualified ? 'true' : 'false'}
          selected={qualified}
          indicator="checkbox"
          render={(props) =>
            createElement('button', { ...props, type: 'button' })
          }
          onClick={() => {
            setQualified(!qualified);
            setChanges((count) => count + 1);
          }}
        >
          <Tag color="blue">Qualified</Tag>
        </ListItem>
        <ListItem
          role="option"
          aria-selected="false"
          disabled
          indicator="checkbox"
          startIcon={<ColorSample colorName="red" />}
          onClick={() => setChanges((count) => count + 1)}
        >
          Unavailable color
        </ListItem>
      </div>
      <p role="status">Changes: {changes}</p>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'a7cde262-38e6-43dc-848a-2b421745515c',
  name: 'twenty-ui-picker-list-items',
  description: 'Single and multiple selection rows in the sandbox',
  component: PickerListItemsExample,
});
