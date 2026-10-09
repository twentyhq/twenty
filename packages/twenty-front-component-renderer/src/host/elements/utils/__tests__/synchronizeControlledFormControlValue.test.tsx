import '@/testing/setupServerRenderingGlobals';

import { act } from 'react';

import { type CaretPreservingElement } from '@/host/caret/types/CaretPreservingElement';
import { createRemoteTextControlRenderer } from '@/testing/createRemoteTextControlRenderer';
import { type InputSelectionDirection } from '@/types/InputSelectionDirection';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const editNativeValue = ({
  hostControl,
  value,
  selectionStart,
  selectionEnd = selectionStart,
  selectionDirection,
}: {
  hostControl: CaretPreservingElement;
  value: string;
  selectionStart: number;
  selectionEnd?: number;
  selectionDirection?: InputSelectionDirection;
}) => {
  Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(hostControl),
    'value',
  )?.set?.call(hostControl, value);
  hostControl.setSelectionRange(
    selectionStart,
    selectionEnd,
    selectionDirection,
  );
  hostControl.dispatchEvent(new Event('input', { bubbles: true }));
};

describe('controlled form control value synchronization with pending edits', () => {
  const { renderRemoteControl, unmountRenderedRemoteControls } =
    createRemoteTextControlRenderer();

  afterEach(unmountRenderedRemoteControls);

  const renderRemoteControlWithDeferredHostEvents = (
    htmlTag: 'input' | 'textarea',
  ) => {
    const pendingHostEvents: (() => void)[] = [];
    const renderedRemoteControl = renderRemoteControl({
      htmlTag,
      deferHostEvent: (dispatchHostEvent) =>
        pendingHostEvents.push(dispatchHostEvent),
    });

    const dispatchPendingHostEvents = async (hostEventCount: number) => {
      await act(async () => {
        for (const dispatchHostEvent of pendingHostEvents.splice(
          0,
          hostEventCount,
        )) {
          dispatchHostEvent();
        }

        await Promise.resolve();
        renderedRemoteControl.connection.flush();
      });
    };

    return {
      ...renderedRemoteControl,
      pendingHostEvents,
      dispatchNextHostEvent: () => dispatchPendingHostEvents(1),
      dispatchAllHostEvents: () =>
        dispatchPendingHostEvents(pendingHostEvents.length),
    };
  };

  it.each(['input', 'textarea'] as const)(
    'should preserve newer native edits while an older %s value returns',
    async (htmlTag) => {
      const {
        connection,
        hostControl,
        remoteControl,
        pendingHostEvents,
        dispatchNextHostEvent,
      } = renderRemoteControlWithDeferredHostEvents(htmlTag);

      hostControl.focus();
      act(() => {
        editNativeValue({ hostControl, value: 'Follow', selectionStart: 6 });
        editNativeValue({
          hostControl,
          value: 'Follow up',
          selectionStart: 6,
          selectionEnd: 8,
          selectionDirection: 'backward',
        });
        remoteControl.setAttribute('placeholder', 'unrelated update');
        connection.flush();
      });

      expect(hostControl.value).toBe('Follow up');
      expect(hostControl.selectionStart).toBe(6);
      expect(hostControl.selectionEnd).toBe(8);
      expect(hostControl.selectionDirection).toBe('backward');
      expect(pendingHostEvents).toHaveLength(2);

      await dispatchNextHostEvent();

      expect(remoteControl.value).toBe('Follow');
      expect(hostControl.value).toBe('Follow up');
      expect(hostControl.selectionStart).toBe(6);
      expect(hostControl.selectionEnd).toBe(8);
      expect(hostControl.selectionDirection).toBe('backward');

      await dispatchNextHostEvent();

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
      const {
        connection,
        hostControl,
        remoteControl,
        pendingHostEvents,
        dispatchNextHostEvent,
      } = renderRemoteControlWithDeferredHostEvents(htmlTag);

      remoteControl.addEventListener('change', () => {
        remoteControl.value = remoteControl.value.toUpperCase();
      });
      remoteControl.addEventListener('blur', () => {});
      act(() => connection.flush());
      hostControl.focus();
      act(() => {
        editNativeValue({ hostControl, value: 'ab', selectionStart: 1 });
        hostControl.dispatchEvent(
          new FocusEvent('focusout', { bubbles: true }),
        );
      });

      expect(pendingHostEvents).toHaveLength(2);
      await dispatchNextHostEvent();

      expect(hostControl.value).toBe('AB');
      expect(hostControl.selectionStart).toBe(1);
      expect(hostControl.selectionEnd).toBe(1);
      await dispatchNextHostEvent();

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
      const { connection, hostControl, remoteControl, dispatchNextHostEvent } =
        renderRemoteControlWithDeferredHostEvents(htmlTag);

      remoteControl.addEventListener('change', () => {
        remoteControl.value = '';
      });
      act(() => {
        remoteControl.value = '';
        connection.flush();
      });
      hostControl.focus();

      for (const value of ['abc', 'abc']) {
        act(() => editNativeValue({ hostControl, value, selectionStart: 3 }));
        await dispatchNextHostEvent();

        expect(remoteControl.value).toBe('');
        expect(hostControl.value).toBe('');
        expect(hostControl.selectionStart).toBe(0);
        expect(hostControl.selectionEnd).toBe(0);
      }
    },
  );

  it('should discard a selection command from an older edit in a batch acknowledging the latest edit', async () => {
    const { connection, hostControl, remoteControl, dispatchAllHostEvents } =
      renderRemoteControlWithDeferredHostEvents('input');

    remoteControl.addEventListener('change', () => {
      if (remoteControl.value === 'a') {
        remoteControl.setSelectionRange(0, 0);
      }
    });
    act(() => connection.flush());
    hostControl.focus();
    act(() => {
      editNativeValue({ hostControl, value: 'a', selectionStart: 1 });
      editNativeValue({ hostControl, value: 'ab', selectionStart: 2 });
    });
    await dispatchAllHostEvents();

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
    const { connection, hostControl, remoteControl, dispatchAllHostEvents } =
      renderRemoteControlWithDeferredHostEvents('input');
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
    act(() => editNativeValue({ hostControl, value: 'ab', selectionStart: 1 }));
    await dispatchAllHostEvents();

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
