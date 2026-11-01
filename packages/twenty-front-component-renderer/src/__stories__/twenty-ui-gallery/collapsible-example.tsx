import { createElement, useState } from 'react';
import { Button } from 'twenty-ui/primitives/input';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { Text } from 'twenty-ui/primitives/typography';

export const CollapsibleExample = () => {
  const [open, setOpen] = useState(false);
  const [changeCount, setChangeCount] = useState(0);
  const [reason, setReason] = useState('none');
  const [clickCount, setClickCount] = useState(0);

  return (
    <>
      <Collapsible.Root
        open={open}
        onOpenChange={(nextOpen, details) => {
          setOpen(nextOpen);
          setReason(details.reason);
          setChangeCount((count) => count + 1);
        }}
        aria-label="Controlled collapsible"
        ref={(element) => {
          element?.setAttribute('data-ref-target', 'collapsible-root');
        }}
        render={<section />}
      >
        <Button onClick={() => setOpen(!open)}>
          Toggle controlled details
        </Button>
        <Collapsible.Trigger
          render={<Button />}
          onClick={() => setClickCount((count) => count + 1)}
          ref={(element) => {
            element?.setAttribute('data-ref-target', 'collapsible-trigger');
          }}
        >
          Controlled details
        </Collapsible.Trigger>
        <Collapsible.Panel
          id="controlled-collapsible-panel"
          keepMounted
          duration="fast"
          aria-label="Controlled panel"
          className={(state) => (state.open ? 'open-panel' : 'closed-panel')}
          style={(state) => ({ padding: state.open ? 7 : 0 })}
          ref={(element) => {
            element?.setAttribute('data-ref-target', 'collapsible-panel');
          }}
          render={(props, state) =>
            createElement('article', {
              ...props,
              'data-render-open': String(state.open),
            })
          }
        >
          <Text>Controlled expandable content</Text>
        </Collapsible.Panel>
      </Collapsible.Root>
      <Text>
        Changes: {changeCount}, reason: {reason}, clicks: {clickCount}
      </Text>
      <Collapsible.Root defaultOpen>
        <Collapsible.Trigger render={<Button />}>
          Uncontrolled details
        </Collapsible.Trigger>
        <Collapsible.Panel>
          <Text>Uncontrolled expandable content</Text>
        </Collapsible.Panel>
      </Collapsible.Root>
      <Collapsible.Root disabled>
        <Collapsible.Trigger render={<Button />}>
          Disabled details
        </Collapsible.Trigger>
        <Collapsible.Panel>
          <Text>Disabled expandable content</Text>
        </Collapsible.Panel>
      </Collapsible.Root>
    </>
  );
};
