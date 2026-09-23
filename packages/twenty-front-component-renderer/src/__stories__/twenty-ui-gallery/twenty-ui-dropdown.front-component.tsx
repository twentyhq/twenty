import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Dropdown } from 'twenty-ui/components';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const ASSIGNEES = ['Ada Lovelace', 'Grace Hopper'];

const DropdownExample = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selection, setSelection] = useState('Unassigned');
  const matchingAssignees = ASSIGNEES.filter((assignee) =>
    assignee.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <TwentyUiGalleryCard title="Dropdown">
      <Dropdown.Root type="menu" open={open} onOpenChange={setOpen}>
        <Dropdown.Trigger render={<Button>Choose assignee</Button>} />
        <Dropdown.Content aria-label="Assignee actions">
          <Dropdown.Page id="root">
            <Dropdown.Section>
              <Dropdown.ActionItem page="assignees">
                Assign person
              </Dropdown.ActionItem>
              <Dropdown.ActionItem onClick={() => setSelection('Unassigned')}>
                Remove assignee
              </Dropdown.ActionItem>
            </Dropdown.Section>
          </Dropdown.Page>
          <Dropdown.Page id="assignees" type="picker">
            <Dropdown.Back>People</Dropdown.Back>
            <Dropdown.Search
              aria-label="Search people"
              value={query}
              onValueChange={setQuery}
              placeholder="Search people"
            />
            <Dropdown.Section>
              {matchingAssignees.map((assignee) => (
                <Dropdown.OptionItem
                  key={assignee}
                  selected={selection === assignee}
                  onSelect={() => setSelection(assignee)}
                >
                  {assignee}
                </Dropdown.OptionItem>
              ))}
              <Dropdown.ActionItem onClick={() => setSelection('New person')}>
                Create person
              </Dropdown.ActionItem>
            </Dropdown.Section>
          </Dropdown.Page>
        </Dropdown.Content>
      </Dropdown.Root>
      <Text role="status">Assignee: {selection}</Text>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '1c7c2c12-3775-47de-8e1e-d8c059b7f405',
  name: 'twenty-ui-dropdown',
  description: 'Dropdown page navigation and mixed picker rows in the sandbox',
  component: DropdownExample,
});
