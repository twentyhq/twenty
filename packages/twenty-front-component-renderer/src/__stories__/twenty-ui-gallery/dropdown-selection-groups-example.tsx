import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

export const DropdownSelectionGroupsExample = () => {
  const [channels, setChannels] = useState<string[]>([]);
  const [channelCallback, setChannelCallback] = useState('pending');

  return (
    <>
      <Dropdown.Root type="picker">
        <Dropdown.Trigger render={<Button>Edit preferences</Button>} />
        <Dropdown.Content aria-label="Preference choices">
          <Dropdown.Section>
            <Dropdown.SelectionGroup
              id="channels"
              aria-label="Channels"
              multiple
              value={channels}
              onValueChange={(nextChannels, details) => {
                if (nextChannels.includes('blocked')) {
                  details.cancel();
                  setChannelCallback(
                    `Canceled: ${details.reason}/${details.event.type}/${details.isCanceled}`,
                  );
                  return;
                }

                setChannels(nextChannels);
                setChannelCallback(
                  `Accepted: ${details.reason}/${details.event.type}/${details.isCanceled}`,
                );
              }}
            >
              <Dropdown.OptionItem
                value="email"
                nativeButton
                render={({ color: _nativeColor, ...props }, state) => (
                  <Button
                    // oxlint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    data-composed-selected={String(state.selected)}
                    data-composed-multiple={String(state.multiple)}
                  />
                )}
              >
                Email alerts
              </Dropdown.OptionItem>
              <Dropdown.OptionItem value="sms" closeOnSelect>
                SMS alerts
              </Dropdown.OptionItem>
              <Dropdown.OptionItem value="blocked" closeOnSelect>
                Blocked alerts
              </Dropdown.OptionItem>
            </Dropdown.SelectionGroup>
            <Dropdown.SelectionGroup
              id="density"
              aria-label="Density"
              defaultValue={null}
            >
              <Dropdown.OptionItem value="compact" closeOnSelect={false}>
                Compact layout
              </Dropdown.OptionItem>
              <Dropdown.OptionItem value="spacious">
                Spacious layout
              </Dropdown.OptionItem>
            </Dropdown.SelectionGroup>
            <Dropdown.SelectionGroup
              id="features"
              aria-label="Features"
              multiple
              defaultValue={[]}
            >
              <Dropdown.OptionItem value="notes">Notes</Dropdown.OptionItem>
              <Dropdown.OptionItem value="tasks">Tasks</Dropdown.OptionItem>
            </Dropdown.SelectionGroup>
            <Dropdown.ActionItem
              closeOnClick={false}
              onClick={() => setChannels([])}
            >
              Clear channels
            </Dropdown.ActionItem>
          </Dropdown.Section>
        </Dropdown.Content>
      </Dropdown.Root>
      <Text role="status" aria-label="Channels selection">
        Channels: {isNonEmptyArray(channels) ? channels.join(', ') : 'none'}
      </Text>
      <Text role="status" aria-label="Channel callback">
        {channelCallback}
      </Text>
    </>
  );
};
