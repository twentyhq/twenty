import { useRef, useState } from 'react';
import {
  Dropdown,
  type DropdownSelectionGroupChangeEventDetails,
} from 'twenty-ui/components/navigation';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

export const DropdownSelectionEventsExample = () => {
  const searchInput = useRef<HTMLInputElement>(null);
  const searchEvent = useRef<KeyboardEvent | null>(null);
  const optionDetails = useRef<DropdownSelectionGroupChangeEventDetails | null>(
    null,
  );
  const clickEvent = useRef<MouseEvent | null>(null);
  const [search, setSearch] = useState('Ada');
  const [callback, setCallback] = useState({
    selection: 'pending',
    event: 'pending',
    target: 'pending',
    trigger: 'pending',
    identity: 'pending',
    click: 'pending',
  });

  return (
    <>
      <Dropdown.Root type="picker">
        <Dropdown.Trigger render={<Button>Inspect selection events</Button>} />
        <Dropdown.Content aria-label="Selection event people">
          <Dropdown.Search
            ref={searchInput}
            aria-label="Search event people"
            value={search}
            onValueChange={setSearch}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                searchEvent.current = event.nativeEvent;
              }
            }}
          />
          <Dropdown.SelectionGroup
            id="event-people"
            aria-label="Event people"
            closeOnSelect={false}
            onValueChange={(value, details) => {
              const { event, trigger } = details;
              const isKeyboardEvent = event instanceof KeyboardEvent;
              const target =
                event.target === searchInput.current ? 'search' : 'option';

              setCallback({
                selection: value ?? 'none',
                event: `${details.reason}/${event.type}/${isKeyboardEvent ? event.key : 'pointer'}/${isKeyboardEvent && event.shiftKey}`,
                target,
                trigger: trigger?.getAttribute('data-event-person') ?? 'none',
                identity: `${event === searchEvent.current}/${details === optionDetails.current}`,
                click: `${clickEvent.current?.type}/${clickEvent.current?.target === trigger}/${event === clickEvent.current}`,
              });
            }}
          >
            {['Ada Lovelace', 'Grace Hopper'].map((person) => (
              <Dropdown.OptionItem
                key={person}
                value={person}
                data-event-person={person}
                onClick={(event) => {
                  clickEvent.current = event.nativeEvent;
                }}
                onSelect={(details) => {
                  optionDetails.current = details;
                }}
              >
                {person}
              </Dropdown.OptionItem>
            ))}
          </Dropdown.SelectionGroup>
        </Dropdown.Content>
      </Dropdown.Root>
      <Text role="status" aria-label="Event selection">
        {callback.selection}
      </Text>
      <Text role="status" aria-label="Selection event">
        {callback.event}
      </Text>
      <Text role="status" aria-label="Selection target">
        {callback.target}
      </Text>
      <Text role="status" aria-label="Selection trigger">
        {callback.trigger}
      </Text>
      <Text role="status" aria-label="Selection identity">
        {callback.identity}
      </Text>
      <Text role="status" aria-label="Selection click">
        {callback.click}
      </Text>
    </>
  );
};
