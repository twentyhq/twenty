import { createElement, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Switch } from 'twenty-ui/primitives/input';
import { ListItem } from 'twenty-ui/primitives/navigation';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const ListItemExample = () => {
  const [selected, setSelected] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [changes, setChanges] = useState(0);
  const [opened, setOpened] = useState(false);

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
      <ListItem
        render={<label />}
        endIcon={
          <Switch
            aria-label="Notifications"
            checked={notifications}
            size="sm"
            onCheckedChange={(checked) => {
              setNotifications(checked);
              setChanges((count) => count + 1);
            }}
          />
        }
      >
        Notifications
      </ListItem>
      <ListItem
        render={<label />}
        disabled
        endIcon={
          <Switch
            aria-label="Disabled notifications"
            disabled
            onCheckedChange={() => setChanges((count) => count + 1)}
          />
        }
      >
        Disabled notifications
      </ListItem>
      <ListItem
        render={(renderProps) =>
          createElement('button', { ...renderProps, type: 'button' })
        }
        hasSubmenu
        onClick={() => setOpened(true)}
      >
        Hidden fields
      </ListItem>
      <p>
        Notifications: {notifications ? 'enabled' : 'disabled'}; Changes:{' '}
        {changes}
      </p>
      <p>Fields: {opened ? 'open' : 'closed'}</p>
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
