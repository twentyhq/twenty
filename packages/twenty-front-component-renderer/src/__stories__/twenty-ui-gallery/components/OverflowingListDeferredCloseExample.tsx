import { isNull } from '@sniptt/guards';
import { type ComponentProps, useRef, useState } from 'react';
import { OverflowingList } from 'twenty-ui/components/layout';
import { Button } from 'twenty-ui/primitives/input';

type OverflowingListActions = NonNullable<
  ComponentProps<typeof OverflowingList>['actionsRef']
>['current'];

export const OverflowingListDeferredCloseExample = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastChange, setLastChange] = useState('none');
  const [popupElement, setPopupElement] = useState<HTMLDivElement | null>(null);
  const actionsRef = useRef<OverflowingListActions>(null);

  return (
    <>
      <OverflowingList
        actionsRef={actionsRef}
        open={isOpen}
        onOpenChange={(nextOpen, details) => {
          setLastChange(`${nextOpen}:${details.reason}`);

          if (!nextOpen) {
            details.preventUnmountOnClose();
          }

          setIsOpen(nextOpen);
        }}
        showOverflowCount
        maxInlineCount={1}
        overflowLabel="Deferred overflow items"
        style={{ width: 300 }}
        popupProps={{ ref: setPopupElement }}
      >
        {[
          <Button key="alpha">Deferred Alpha</Button>,
          <Button key="bravo">Deferred Bravo</Button>,
          <Button key="close" onClick={() => actionsRef.current?.close()}>
            Close deferred overflow
          </Button>,
        ]}
      </OverflowingList>
      <Button onClick={() => setIsOpen(true)}>Open deferred overflow</Button>
      <Button onClick={() => actionsRef.current?.unmount()}>
        Complete deferred exit
      </Button>
      <output aria-label="Deferred overflow open changes">{lastChange}</output>
      <output aria-label="Deferred overflow popup mounted">
        {isNull(popupElement) ? 'unmounted' : 'mounted'}
      </output>
    </>
  );
};
