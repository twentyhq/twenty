import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';
import { DropdownSelectionGroupsExample } from '@/__stories__/twenty-ui-gallery/dropdown-selection-groups-example';
import { DropdownSelectionEventsExample } from '@/__stories__/twenty-ui-gallery/dropdown-selection-events-example';
import { DropdownSessionDraft } from '@/__stories__/twenty-ui-gallery/dropdown-session-draft';

const ASSIGNEES = ['Ada Lovelace', 'Grace Hopper'];

const DropdownExample = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selection, setSelection] = useState<string | null>(null);
  const [actionCount, setActionCount] = useState(0);
  const [isLastAssigneeFirst, setIsLastAssigneeFirst] = useState(false);
  const rankedAssignees = isLastAssigneeFirst
    ? [...ASSIGNEES].reverse()
    : ASSIGNEES;
  const matchingAssignees = rankedAssignees.filter((assignee) =>
    assignee.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <TwentyUiGalleryCard title="Dropdown">
      <Dropdown.Root
        type="menu"
        defaultPage="actions"
        open={open}
        onOpenChange={setOpen}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <Dropdown.Trigger render={<Button>Choose assignee</Button>} />
        <Dropdown.Content aria-label="Assignee actions">
          <Dropdown.Page id="actions">
            <Dropdown.Section>
              <Dropdown.ActionItem
                page="assignees"
                shortcut={[['G'], ['A']]}
                shortcutJoinLabel="followed by"
              >
                Assign person
              </Dropdown.ActionItem>
              <Dropdown.ActionItem
                disabled
                onClick={() => setSelection('Archived')}
              >
                Archive assignee
              </Dropdown.ActionItem>
              <Dropdown.ActionItem
                nativeButton
                render={<Button />}
                ref={(element: HTMLElement | null) => {
                  if (isDefined(element)) {
                    element.dataset.refTag = element.tagName;
                  }
                }}
                onClick={() => setActionCount((count) => count + 1)}
              >
                Duplicate assignment
              </Dropdown.ActionItem>
              <Dropdown.ActionItem onClick={() => setSelection(null)}>
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
              <Dropdown.SelectionGroup
                id="assignees"
                aria-label="Assignees"
                value={selection}
                onValueChange={setSelection}
              >
                {matchingAssignees.map((assignee) => (
                  <Dropdown.OptionItem
                    key={assignee}
                    value={assignee}
                    shortcut={[['G'], [assignee.charAt(0)]]}
                    shortcutJoinLabel="next"
                  >
                    {assignee}
                  </Dropdown.OptionItem>
                ))}
              </Dropdown.SelectionGroup>
              <Dropdown.ActionItem onClick={() => setSelection('New person')}>
                Create person
              </Dropdown.ActionItem>
              <Dropdown.ActionItem
                closeOnClick={false}
                onClick={() => setIsLastAssigneeFirst(true)}
              >
                Rank last first
              </Dropdown.ActionItem>
            </Dropdown.Section>
            <DropdownSessionDraft />
          </Dropdown.Page>
        </Dropdown.Content>
      </Dropdown.Root>
      <Button>Outside picker</Button>
      <Text role="status" aria-label="Assignee">
        Assignee: {selection ?? 'Unassigned'}
      </Text>
      <Text role="status" aria-label="Search query">
        Query: {query}
      </Text>
      <Text role="status" aria-label="Assignment actions">
        Actions: {actionCount}
      </Text>
      <DropdownSelectionGroupsExample />
      <DropdownSelectionEventsExample />
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '1c7c2c12-3775-47de-8e1e-d8c059b7f405',
  name: 'twenty-ui-dropdown',
  description: 'Dropdown page navigation and mixed picker rows in the sandbox',
  component: DropdownExample,
});
