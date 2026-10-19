import { isString } from '@sniptt/guards';
import { useRef, useState } from 'react';
import { OverflowingList } from 'twenty-ui/components/layout';
import { Button } from 'twenty-ui/primitives/input';

import { OverflowingListDeferredCloseExample } from './OverflowingListDeferredCloseExample';

export const OverflowingListApiExample = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEscapeBlocked, setIsEscapeBlocked] = useState(true);
  const [lastChange, setLastChange] = useState('none');
  const [nativeTargets, setNativeTargets] = useState('unread');
  const [parentActivations, setParentActivations] = useState(0);
  const [lastPopupClick, setLastPopupClick] = useState('none');
  const [lastTriggerClick, setLastTriggerClick] = useState('none');
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        role="presentation"
        onClick={() => setParentActivations((count) => count + 1)}
      >
        <OverflowingList
          ref={rootRef}
          data-native-root="controlled"
          open={isOpen}
          onOpenChange={(nextOpen, details) => {
            setLastChange(
              `${nextOpen}:${details.reason}:${details.event.type}`,
            );
            setNativeTargets(
              [
                rootRef.current?.getAttribute('data-native-root'),
                triggerRef.current?.getAttribute('data-native-trigger'),
                popupRef.current?.getAttribute('data-native-popup'),
              ].join(','),
            );

            if (isEscapeBlocked && details.reason === 'escape-key') {
              details.cancel();
              return;
            }

            setIsOpen(nextOpen);
          }}
          showOverflowCount
          maxInlineCount={1}
          overflowLabel="Controlled overflow items"
          style={{ width: 300 }}
          triggerProps={{
            ref: triggerRef,
            render: <Button variant="outline" data-native-trigger="custom" />,
            'aria-label': 'Custom overflow trigger',
            onClick: (event) => setLastTriggerClick(event.nativeEvent.type),
          }}
          popupProps={{
            ref: popupRef,
            render: <section data-native-popup="section" />,
            onClick: (event) => {
              const targetText =
                'textContent' in event.target &&
                isString(event.target.textContent)
                  ? event.target.textContent
                  : '';

              setLastPopupClick(`${event.nativeEvent.type}:${targetText}`);
            },
          }}
        >
          {['Controlled Alpha', 'Controlled Bravo', 'Controlled Charlie'].map(
            (target) => (
              <Button key={target}>{target}</Button>
            ),
          )}
        </OverflowingList>
      </div>
      <Button onClick={() => setIsOpen(true)}>Open controlled overflow</Button>
      <Button onClick={() => setIsOpen(false)}>
        Close controlled overflow
      </Button>
      <Button onClick={() => setIsEscapeBlocked(false)}>
        Allow overflow Escape
      </Button>
      <OverflowingList
        defaultOpen
        showOverflowCount
        maxInlineCount={0}
        overflowLabel="Initially open overflow"
        style={{ width: 300 }}
      >
        {[<Button key="initial">Initially hidden item</Button>]}
      </OverflowingList>
      <OverflowingListDeferredCloseExample />
      <output aria-label="Overflow trigger click">{lastTriggerClick}</output>
      <output aria-label="Overflow popup click">{lastPopupClick}</output>
      <output aria-label="Overflow open changes">{lastChange}</output>
      <output aria-label="Overflow native targets">{nativeTargets}</output>
      <output aria-label="Overflow parent activations">
        {parentActivations}
      </output>
    </>
  );
};
