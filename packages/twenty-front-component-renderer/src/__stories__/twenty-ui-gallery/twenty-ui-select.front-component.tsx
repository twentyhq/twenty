import { useRef, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  Button,
  Field,
  Select,
  type SelectRootChangeEventReason,
} from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const SelectExample = () => {
  const [value, setValue] = useState<string | null>('new');
  const [changes, setChanges] = useState(0);
  const [reason, setReason] = useState<SelectRootChangeEventReason>('none');
  const [eventType, setEventType] = useState('none');
  const [referenceTargets, setReferenceTargets] = useState('unread');
  const [segments, setSegments] = useState(['priority']);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRef = useRef<HTMLElement>(null);

  return (
    <TwentyUiGalleryCard title="Select">
      <form aria-label="Account classification">
        <Field.Root>
          <Field.Label>Account stage</Field.Label>
          <Select.Root
            name="stage"
            inputRef={inputRef}
            value={value}
            onValueChange={(nextValue, details) => {
              setValue(nextValue);
              setChanges((count) => count + 1);
              setReason(details.reason);
              setEventType(details.event.type);
              setReferenceTargets(
                `${triggerRef.current?.getAttribute('data-native-trigger') ?? 'missing'}/${inputRef.current?.name ?? 'missing'}/${itemRef.current?.getAttribute('data-native-item') ?? 'missing'}`,
              );
            }}
            items={{ new: 'New', qualified: 'Qualified', archived: 'Archived' }}
          >
            <Select.Trigger
              ref={triggerRef}
              data-native-trigger="stage"
              render={<Button variant="outline" />}
            >
              <Select.Value placeholder="Choose a stage" />
              <Select.Icon />
            </Select.Trigger>
            <Select.Portal data-select-portal="stage">
              <Select.Positioner
                align="start"
                sideOffset={8}
                alignItemWithTrigger={false}
                positionMethod="fixed"
                collisionAvoidance={{ side: 'flip', align: 'shift' }}
                data-select-positioner="stage"
              >
                <Select.Popup>
                  <Select.List render={<ul />}>
                    <Select.Group>
                      <Select.GroupLabel>Active stages</Select.GroupLabel>
                      <Select.Item
                        value="new"
                        nativeButton
                        render={<Button variant="ghost" />}
                      >
                        <Select.ItemText>New</Select.ItemText>
                        <Select.ItemIndicator />
                      </Select.Item>
                      <Select.Item
                        ref={itemRef}
                        value="qualified"
                        data-native-item="qualified"
                        render={<li />}
                      >
                        <Select.ItemText>Qualified</Select.ItemText>
                        <Select.ItemIndicator />
                      </Select.Item>
                    </Select.Group>
                    <Select.Separator />
                    <Select.Item value="archived" disabled render={<li />}>
                      <Select.ItemText>Archived</Select.ItemText>
                      <Select.ItemIndicator />
                    </Select.Item>
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </Field.Root>
        <Select.Root
          name="segments"
          multiple
          defaultValue={['priority']}
          items={{ priority: 'Priority', renewal: 'Renewal' }}
          onValueChange={setSegments}
        >
          <Select.Trigger aria-label="Account segments">
            <Select.Value placeholder="Choose segments" />
            <Select.Icon />
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner
              align="start"
              sideOffset={8}
              alignItemWithTrigger={false}
            >
              <Select.Popup>
                <Select.List>
                  <Select.Item value="priority">
                    <Select.ItemText>Priority</Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                  <Select.Item value="renewal">
                    <Select.ItemText>Renewal</Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
        <Button onClick={() => setValue(null)}>Clear stage</Button>
        <Text role="status" aria-label="Stage selection">
          Stage: {value ?? 'empty'}; Changes: {changes}; Reason: {reason};
          Event: {eventType}; Refs: {referenceTargets}
        </Text>
        <Text role="status" aria-label="Segment selection">
          Segments: {segments.join(', ') || 'empty'}
        </Text>
      </form>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840007',
  name: 'twenty-ui-select',
  description:
    'Select public parts, selection callbacks and native forms in the sandbox',
  component: SelectExample,
});
