import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import {
  Menu,
  type MenuRootChangeEventReason,
} from 'twenty-ui/primitives/surfaces';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';
import { MenuSelectionExample } from '@/__stories__/twenty-ui-gallery/menu-selection-example';
import { MenuSubmenuExample } from '@/__stories__/twenty-ui-gallery/menu-submenu-example';

const MenuExample = () => {
  const [action, setAction] = useState('none');
  const [open, setOpen] = useState(false);
  const [cancelOpening, setCancelOpening] = useState(false);
  const [reason, setReason] = useState<MenuRootChangeEventReason>('none');
  const [eventType, setEventType] = useState('none');

  return (
    <TwentyUiGalleryCard title="Menu">
      <Button onClick={() => setCancelOpening(!cancelOpening)}>
        {cancelOpening ? 'Allow menu opening' : 'Cancel menu opening'}
      </Button>
      <Menu.Root
        open={open}
        onOpenChange={(nextOpen, details) => {
          setReason(details.reason);
          setEventType(details.event.type);
          if (nextOpen && cancelOpening) {
            details.cancel();
            return;
          }
          setOpen(nextOpen);
        }}
      >
        <Menu.Trigger
          data-native-trigger="account"
          ref={(element: HTMLElement | null) => {
            if (isDefined(element)) {
              element.dataset.refTag = element.tagName;
            }
          }}
          render={<Button variant="outline">Account actions</Button>}
        />
        <Menu.Portal data-menu-portal="">
          <Menu.Positioner
            side="bottom"
            align="start"
            sideOffset={({ anchor }) => anchor.height / 4}
            collisionAvoidance={{ side: 'flip', align: 'shift' }}
            positionMethod="fixed"
            data-menu-positioner=""
          >
            <Menu.Popup data-menu-popup="" render={<section />}>
              <Menu.Arrow data-menu-arrow="" />
              <Menu.Viewport data-menu-viewport="">
                <Menu.Group>
                  <Menu.GroupLabel>Record</Menu.GroupLabel>
                  <Menu.Item
                    nativeButton
                    render={<Button />}
                    shortcut={[['G'], ['A']]}
                    shortcutJoinLabel="followed by"
                    ref={(element) => {
                      if (isDefined(element)) {
                        element.dataset.refTag = element.tagName;
                      }
                    }}
                    onClick={(event) =>
                      setAction(`duplicated:${event.currentTarget.tagName}`)
                    }
                  >
                    Duplicate
                  </Menu.Item>
                  <Menu.Item disabled onClick={() => setAction('archived')}>
                    Archive
                  </Menu.Item>
                </Menu.Group>
                <Menu.Separator />
                <MenuSelectionExample />
                <Menu.Separator />
                <MenuSubmenuExample onAction={setAction} />
                <Menu.LinkItem href="#menu-destination" target="_self">
                  Account link
                </Menu.LinkItem>
              </Menu.Viewport>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
      <Text role="status" aria-label="Menu action">
        Action: {action}
      </Text>
      <Text role="status" aria-label="Menu open request">
        Menu: {open ? 'open' : 'closed'}; reason: {reason}; event: {eventType}
      </Text>
      <Text id="menu-destination">Account destination</Text>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840006',
  name: 'twenty-ui-menu',
  description: 'Menu parts, composition, callbacks, selection and submenus',
  component: MenuExample,
});
