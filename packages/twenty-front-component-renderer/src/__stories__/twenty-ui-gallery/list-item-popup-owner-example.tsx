import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { Menu } from 'twenty-ui/primitives/surfaces';
import { Text } from 'twenty-ui/primitives/typography';

export const ListItemPopupOwnerExample = () => {
  const [activations, setActivations] = useState(0);

  return (
    <>
      <Menu.Root>
        <Menu.Trigger render={<Button>Preference actions</Button>} />
        <Menu.Popup>
          <Menu.Item
            nativeButton
            render={<button type="button" />}
            description="Popup owner"
            onClick={() => setActivations((count) => count + 1)}
            ref={(element) => {
              if (isDefined(element)) {
                element.dataset.refTag = element.tagName;
              }
            }}
          >
            Enable notifications
          </Menu.Item>
          <Menu.Item
            disabled
            nativeButton
            render={<button type="button" />}
            onClick={() => setActivations((count) => count + 1)}
          >
            Unavailable notifications
          </Menu.Item>
        </Menu.Popup>
      </Menu.Root>
      <Text aria-label="Popup activations">
        Popup activations: {activations}
      </Text>
    </>
  );
};
