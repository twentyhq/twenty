import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

export const ListItemPopupOwnerExample = () => {
  const [activations, setActivations] = useState(0);

  return (
    <>
      <Dropdown.Root type="menu">
        <Dropdown.Trigger render={<Button>Preference actions</Button>} />
        <Dropdown.Content>
          <Dropdown.ActionItem
            nativeButton
            render={<button type="button" />}
            description="Popup owner"
            onClick={() => setActivations((count) => count + 1)}
            ref={(element: HTMLElement | null) => {
              if (isDefined(element)) {
                element.dataset.refTag = element.tagName;
              }
            }}
          >
            Enable notifications
          </Dropdown.ActionItem>
          <Dropdown.ActionItem
            disabled
            nativeButton
            render={<button type="button" />}
            onClick={() => setActivations((count) => count + 1)}
          >
            Unavailable notifications
          </Dropdown.ActionItem>
        </Dropdown.Content>
      </Dropdown.Root>
      <Text aria-label="Popup activations">
        Popup activations: {activations}
      </Text>
    </>
  );
};
