import '@/testing/setupServerRenderingGlobals';

import { act } from 'react';

import { type CaretPreservingElement } from '@/host/caret/types/CaretPreservingElement';
import { createRemoteTextControlRenderer } from '@/testing/createRemoteTextControlRenderer';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const setNativeValue = ({
  hostControl,
  value,
}: {
  hostControl: CaretPreservingElement;
  value: string;
}) => {
  const elementPrototype =
    hostControl.tagName === 'INPUT'
      ? HTMLInputElement.prototype
      : HTMLTextAreaElement.prototype;

  Object.getOwnPropertyDescriptor(elementPrototype, 'value')?.set?.call(
    hostControl,
    value,
  );
};

describe('controlled form control value synchronization with pending edits', () => {
  const { renderRemoteControl, unmountRenderedRemoteControls } =
    createRemoteTextControlRenderer();

  afterEach(unmountRenderedRemoteControls);

  it.each(['input', 'textarea'] as const)(
    'should preserve newer native edits while an older %s value returns',
    async (htmlTag) => {
      const pendingEvents: (() => void)[] = [];
      const { connection, hostControl, remoteControl } = renderRemoteControl({
        htmlTag,
        deferHostEvent: (dispatchHostEvent) =>
          pendingEvents.push(dispatchHostEvent),
      });

      hostControl.focus();
      act(() => {
        setNativeValue({ hostControl, value: 'Follow' });
        hostControl.setSelectionRange(6, 6);
        hostControl.dispatchEvent(new Event('input', { bubbles: true }));
        setNativeValue({ hostControl, value: 'Follow up' });
        hostControl.setSelectionRange(6, 8, 'backward');
        hostControl.dispatchEvent(new Event('input', { bubbles: true }));
        remoteControl.setAttribute('placeholder', 'unrelated update');
        connection.flush();
      });

      expect(hostControl.value).toBe('Follow up');
      expect(hostControl.selectionStart).toBe(6);
      expect(hostControl.selectionEnd).toBe(8);
      expect(hostControl.selectionDirection).toBe('backward');
      expect(pendingEvents).toHaveLength(2);

      await act(async () => {
        pendingEvents.shift()?.();
        await Promise.resolve();
        connection.flush();
      });

      expect(remoteControl.value).toBe('Follow');
      expect(hostControl.value).toBe('Follow up');
      expect(hostControl.selectionStart).toBe(6);
      expect(hostControl.selectionEnd).toBe(8);
      expect(hostControl.selectionDirection).toBe('backward');

      await act(async () => {
        pendingEvents.shift()?.();
        await Promise.resolve();
        connection.flush();
      });

      expect(remoteControl.value).toBe('Follow up');
      expect(hostControl.value).toBe('Follow up');
      expect(hostControl.selectionStart).toBe(6);
      expect(hostControl.selectionEnd).toBe(8);
      expect(hostControl.selectionDirection).toBe('backward');
    },
  );

  it.each(['input', 'textarea'] as const)(
    'should preserve an acknowledged same-length %s transform through a delayed blur snapshot',
    async (htmlTag) => {
      const pendingEvents: (() => void)[] = [];
      const { connection, hostControl, remoteControl } = renderRemoteControl({
        htmlTag,
        deferHostEvent: (dispatchHostEvent) =>
          pendingEvents.push(dispatchHostEvent),
      });

      remoteControl.addEventListener('change', () => {
        remoteControl.value = remoteControl.value.toUpperCase();
      });
      remoteControl.addEventListener('blur', () => {});
      act(() => connection.flush());
      hostControl.focus();
      act(() => {
        setNativeValue({ hostControl, value: 'ab' });
        hostControl.setSelectionRange(1, 1);
        hostControl.dispatchEvent(new Event('input', { bubbles: true }));
        hostControl.dispatchEvent(
          new FocusEvent('focusout', { bubbles: true }),
        );
      });

      expect(pendingEvents).toHaveLength(2);
      await act(async () => {
        pendingEvents.shift()?.();
        await Promise.resolve();
        connection.flush();
      });

      expect(hostControl.value).toBe('AB');
      expect(hostControl.selectionStart).toBe(1);
      expect(hostControl.selectionEnd).toBe(1);
      await act(async () => {
        pendingEvents.shift()?.();
        await Promise.resolve();
        connection.flush();
      });

      expect(remoteControl.value).toBe('AB');
      expect(hostControl.value).toBe('AB');
      expect(hostControl.selectionStart).toBe(1);
      expect(hostControl.selectionEnd).toBe(1);

      act(() => {
        remoteControl.value = 'xy';
        connection.flush();
      });

      expect(hostControl.value).toBe('xy');
      expect(hostControl.selectionStart).toBe(1);
      expect(hostControl.selectionEnd).toBe(1);
    },
  );

  it.each(['input', 'textarea'] as const)(
    'should apply repeated %s resets after acknowledging each native edit',
    async (htmlTag) => {
      const pendingEvents: (() => void)[] = [];
      const { connection, hostControl, remoteControl } = renderRemoteControl({
        htmlTag,
        deferHostEvent: (dispatchHostEvent) =>
          pendingEvents.push(dispatchHostEvent),
      });

      remoteControl.addEventListener('change', () => {
        remoteControl.value = '';
      });
      act(() => {
        remoteControl.value = '';
        connection.flush();
      });
      hostControl.focus();

      for (const value of ['abc', 'abc']) {
        act(() => {
          setNativeValue({ hostControl, value });
          hostControl.setSelectionRange(3, 3);
          hostControl.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await act(async () => {
          pendingEvents.shift()?.();
          await Promise.resolve();
          connection.flush();
        });

        expect(remoteControl.value).toBe('');
        expect(hostControl.value).toBe('');
        expect(hostControl.selectionStart).toBe(0);
        expect(hostControl.selectionEnd).toBe(0);
      }
    },
  );

  it('should discard a selection command from an older edit in a batch acknowledging the latest edit', async () => {
    const pendingEvents: (() => void)[] = [];
    const { connection, hostControl, remoteControl } = renderRemoteControl({
      htmlTag: 'input',
      deferHostEvent: (dispatchHostEvent) =>
        pendingEvents.push(dispatchHostEvent),
    });

    remoteControl.addEventListener('change', () => {
      if (remoteControl.value === 'a') {
        remoteControl.setSelectionRange(0, 0);
      }
    });
    act(() => connection.flush());
    hostControl.focus();
    act(() => {
      setNativeValue({ hostControl, value: 'a' });
      hostControl.setSelectionRange(1, 1);
      hostControl.dispatchEvent(new Event('input', { bubbles: true }));
      setNativeValue({ hostControl, value: 'ab' });
      hostControl.setSelectionRange(2, 2);
      hostControl.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => {
      for (const dispatchHostEvent of pendingEvents.splice(0)) {
        dispatchHostEvent();
      }

      await Promise.resolve();
      connection.flush();
    });

    expect(hostControl.value).toBe('ab');
    expect(hostControl.selectionStart).toBe(2);
    expect(hostControl.selectionEnd).toBe(2);
    act(() => {
      remoteControl.setSelectionRange(0, 1, 'backward');
      connection.flush();
    });

    expect(hostControl.selectionStart).toBe(0);
    expect(hostControl.selectionEnd).toBe(1);
    expect(hostControl.selectionDirection).toBe('backward');
  });

  it('should forward both input and change callbacks without replaying the native value over a transform', async () => {
    const pendingEvents: (() => void)[] = [];
    const { connection, hostControl, remoteControl } = renderRemoteControl({
      htmlTag: 'input',
      deferHostEvent: (dispatchHostEvent) =>
        pendingEvents.push(dispatchHostEvent),
    });
    const receivedEvents: {
      type: string;
      target: EventTarget | null;
      currentTarget: EventTarget | null;
      value: string;
    }[] = [];

    remoteControl.addEventListener('input', (event) => {
      remoteControl.value = remoteControl.value.toUpperCase();
      receivedEvents.push({
        type: event.type,
        target: event.target,
        currentTarget: event.currentTarget,
        value: remoteControl.value,
      });
    });
    remoteControl.addEventListener('change', (event) => {
      receivedEvents.push({
        type: event.type,
        target: event.target,
        currentTarget: event.currentTarget,
        value: remoteControl.value,
      });
    });
    act(() => connection.flush());
    hostControl.focus();
    act(() => {
      setNativeValue({ hostControl, value: 'ab' });
      hostControl.setSelectionRange(1, 1);
      hostControl.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => {
      for (const dispatchHostEvent of pendingEvents.splice(0)) {
        dispatchHostEvent();
      }

      await Promise.resolve();
      connection.flush();
    });

    expect(receivedEvents).toEqual([
      {
        type: 'input',
        target: remoteControl,
        currentTarget: remoteControl,
        value: 'AB',
      },
      {
        type: 'change',
        target: remoteControl,
        currentTarget: remoteControl,
        value: 'AB',
      },
    ]);
    expect(remoteControl.value).toBe('AB');
    expect(hostControl.value).toBe('AB');
    expect(hostControl.selectionStart).toBe(1);
    expect(hostControl.selectionEnd).toBe(1);
  });
});
