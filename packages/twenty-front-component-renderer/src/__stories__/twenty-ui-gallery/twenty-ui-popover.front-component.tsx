import { useRef, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Button } from 'twenty-ui/primitives/input';
import {
  Popover,
  type PopoverRootChangeEventReason,
} from 'twenty-ui/primitives/surfaces';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const PopoverExample = () => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<PopoverRootChangeEventReason>('none');
  const [triggerTarget, setTriggerTarget] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <TwentyUiGalleryCard title="Popover">
      <Popover.Root
        open={open}
        onOpenChange={(nextOpen, details) => {
          setOpen(nextOpen);
          setReason(details.reason);
          setTriggerTarget(
            triggerRef.current?.getAttribute('data-native-trigger') ??
              'missing',
          );
        }}
      >
        <Popover.Trigger
          ref={triggerRef}
          data-native-trigger="account"
          render={<Button variant="outline">Account details</Button>}
        />
        <Popover.Portal data-popover-portal="">
          <Popover.Positioner
            side="bottom"
            align="start"
            sideOffset={({ anchor }) => anchor.height / 4}
            collisionAvoidance={{ side: 'flip', align: 'shift' }}
            positionMethod="fixed"
            data-popover-positioner=""
          >
            <Popover.Popup data-popover-popup="" render={<section />}>
              <Popover.Arrow />
              <Popover.Viewport>
                <Popover.Title>Account owner</Popover.Title>
                <Popover.Description>
                  Alice manages this account
                </Popover.Description>
                <Popover.Close render={<Button>Close details</Button>} />
              </Popover.Viewport>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
      <p role="status">
        Details: {open ? 'open' : 'closed'}; reason: {reason}; target:{' '}
        {triggerTarget}
      </p>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840005',
  name: 'twenty-ui-popover',
  description: 'Popover public parts and controlled trigger contract',
  component: PopoverExample,
});
