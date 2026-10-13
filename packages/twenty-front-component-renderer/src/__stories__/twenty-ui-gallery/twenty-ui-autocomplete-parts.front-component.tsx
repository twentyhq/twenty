import { useRef, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { isDefined } from 'twenty-shared/utils';
import { Autocomplete, Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

type Person = { identifier: string; name: string };
type PeopleGroup = { label: string; items: readonly Person[] };

const PEOPLE_GROUPS: readonly PeopleGroup[] = [
  {
    label: 'Sales',
    items: [
      { identifier: 'alice', name: 'Alice Johnson' },
      { identifier: 'bob', name: 'Bob Smith' },
    ],
  },
  {
    label: 'Support',
    items: [{ identifier: 'carol', name: 'Carol Wilson' }],
  },
];

const AutocompletePartsExample = () => {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [cancelEscape, setCancelEscape] = useState(true);
  const [changeDetails, setChangeDetails] = useState('none');
  const [openDetails, setOpenDetails] = useState('none');
  const [highlightDetails, setHighlightDetails] = useState('none');
  const [selectedPerson, setSelectedPerson] = useState('none');
  const [selections, setSelections] = useState(0);
  const [inputTarget, setInputTarget] = useState('none');
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <TwentyUiGalleryCard title="Autocomplete parts">
      <Autocomplete.Root
        items={PEOPLE_GROUPS}
        itemToStringValue={(person) => person.name}
        value={value}
        open={open}
        autoHighlight="always"
        openOnInputClick
        onValueChange={(nextValue, details) => {
          setValue(nextValue);
          setChangeDetails(`${details.reason}/${details.event.type}`);
          setInputTarget(
            inputRef.current?.getAttribute('data-native-owner') ?? 'missing',
          );
        }}
        onOpenChange={(nextOpen, details) => {
          const shouldCancelEscape =
            cancelEscape && details.reason === 'escape-key';

          if (shouldCancelEscape) {
            details.cancel();
            setOpenDetails(`${details.reason}/canceled:${details.isCanceled}`);
            return;
          }

          setOpen(nextOpen);
          setOpenDetails(`${details.reason}/${details.event.type}`);
        }}
        onItemHighlighted={(person, details) => {
          setHighlightDetails(
            `${isDefined(person) ? person.name : 'none'}/${details.reason}`,
          );
        }}
      >
        <Autocomplete.InputGroup>
          <Autocomplete.Input
            ref={inputRef}
            aria-label="Account owner"
            name="accountOwner"
            render={<input data-native-owner="account-owner" />}
          />
          <Autocomplete.Trigger
            aria-label="Show people"
            render={<Button variant="outline" />}
          >
            <Autocomplete.Icon>Show people</Autocomplete.Icon>
          </Autocomplete.Trigger>
          <Autocomplete.Clear render={<Button variant="ghost" />}>
            Clear people
          </Autocomplete.Clear>
        </Autocomplete.InputGroup>
        <Autocomplete.Portal data-autocomplete-portal="">
          <Autocomplete.Positioner
            side="bottom"
            align="start"
            sideOffset={8}
            positionMethod="fixed"
            collisionAvoidance={{ side: 'flip', align: 'shift' }}
            data-autocomplete-positioner=""
          >
            <Autocomplete.Popup
              render={<section role="region" aria-label="People suggestions" />}
              data-autocomplete-popup=""
            >
              <Autocomplete.Arrow />
              <Autocomplete.Status>People matches</Autocomplete.Status>
              <Autocomplete.Empty>No matching people.</Autocomplete.Empty>
              <Autocomplete.List aria-label="People">
                {(group: PeopleGroup) => (
                  <Autocomplete.Group key={group.label} items={group.items}>
                    <Autocomplete.GroupLabel>
                      {group.label}
                    </Autocomplete.GroupLabel>
                    <Autocomplete.Collection>
                      {(person: Person) => (
                        <Autocomplete.Item
                          key={person.identifier}
                          value={person}
                          onClick={() => {
                            setSelectedPerson(person.name);
                            setSelections((count) => count + 1);
                          }}
                        >
                          {person.name}
                        </Autocomplete.Item>
                      )}
                    </Autocomplete.Collection>
                  </Autocomplete.Group>
                )}
              </Autocomplete.List>
              <Button onClick={() => setCancelEscape(false)}>
                Allow Escape
              </Button>
              <Autocomplete.Separator />
            </Autocomplete.Popup>
          </Autocomplete.Positioner>
        </Autocomplete.Portal>
        <Text role="status" aria-label="Owner value">
          <Autocomplete.Value>
            {(currentValue) => currentValue || 'empty'}
          </Autocomplete.Value>
        </Text>
      </Autocomplete.Root>
      <Button onClick={() => setValue('Carol Wilson')}>Set Carol</Button>
      <Text role="status" aria-label="Owner callbacks">
        Change: {changeDetails}; Open: {openDetails}; Highlight:{' '}
        {highlightDetails}; Input: {inputTarget}
      </Text>
      <Text role="status" aria-label="Owner selection">
        {selectedPerson}; Selections: {selections}
      </Text>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '0561616d-6aa8-4c65-b0e4-a8bda6dd5d30',
  name: 'twenty-ui-autocomplete-parts',
  description: 'Autocomplete grouped objects, public popup parts and callbacks',
  component: AutocompletePartsExample,
});
