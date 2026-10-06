import { MAX_SERIALIZED_EVENT_TEXT_LENGTH } from '@/host/events/constants/MaxSerializedEventTextLength';

import { serializeEvent } from '../serializeEvent';

describe('serializeEvent', () => {
  it('should return an unknown type for a non-object', () => {
    expect(serializeEvent(null)).toEqual({ type: 'unknown' });
  });

  it('should default the type to unknown when missing', () => {
    expect(serializeEvent({})).toEqual({ type: 'unknown' });
  });

  it('should copy only whitelisted, correctly-typed properties', () => {
    const result = serializeEvent({
      type: 'click',
      clientX: 10,
      clientY: 20,
      altKey: true,
      key: 'Enter',
      unexpected: 'ignored',
    });

    expect(result).toEqual({
      type: 'click',
      clientX: 10,
      clientY: 20,
      altKey: true,
      key: 'Enter',
    });
  });

  it('should ignore properties with the wrong type', () => {
    const result = serializeEvent({ type: 'wheel', deltaX: 'not-a-number' });

    expect(result).toEqual({ type: 'wheel' });
  });

  it('should copy the numeric click count but not custom event payloads', () => {
    expect(serializeEvent({ type: 'click', detail: 2 })).toEqual({
      type: 'click',
      detail: 2,
    });
    expect(serializeEvent({ type: 'custom', detail: { payload: 1 } })).toEqual({
      type: 'custom',
    });
  });

  it('should map first changed touch coordinates into coordinate fields', () => {
    const result = serializeEvent({
      type: 'touchstart',
      changedTouches: {
        length: 1,
        0: {
          clientX: 10,
          clientY: 20,
          pageX: 30,
          pageY: 40,
          screenX: 50,
          screenY: 60,
        },
      },
    });

    expect(result).toEqual({
      type: 'touchstart',
      clientX: 10,
      clientY: 20,
      pageX: 30,
      pageY: 40,
      screenX: 50,
      screenY: 60,
    });
  });

  it('should keep own coordinates over changed touch coordinates', () => {
    const result = serializeEvent({
      type: 'mousemove',
      clientX: 1,
      changedTouches: { length: 1, 0: { clientX: 99 } },
    });

    expect(result.clientX).toBe(1);
  });

  it('should ignore an empty changed touches list', () => {
    const result = serializeEvent({
      type: 'touchend',
      changedTouches: { length: 0 },
    });

    expect(result).toEqual({ type: 'touchend' });
  });

  it('should forward the input type and data of a beforeinput event', () => {
    const result = serializeEvent({
      type: 'beforeinput',
      inputType: 'insertText',
      data: 'a',
    });

    expect(result).toEqual({
      type: 'beforeinput',
      inputType: 'insertText',
      data: 'a',
    });
  });

  it('should forward the input type without data on a deletion beforeinput', () => {
    const result = serializeEvent({
      type: 'beforeinput',
      inputType: 'deleteContentBackward',
      data: null,
    });

    expect(result).toEqual({
      type: 'beforeinput',
      inputType: 'deleteContentBackward',
    });
  });

  it('should cap the forwarded data length', () => {
    const result = serializeEvent({
      type: 'beforeinput',
      inputType: 'insertFromPaste',
      data: 'a'.repeat(MAX_SERIALIZED_EVENT_TEXT_LENGTH + 1),
    });

    expect(result.data).toHaveLength(MAX_SERIALIZED_EVENT_TEXT_LENGTH);
  });

  it('should forward the composition data', () => {
    const result = serializeEvent({
      type: 'compositionupdate',
      data: 'か',
    });

    expect(result).toEqual({ type: 'compositionupdate', data: 'か' });
  });

  it('should forward the clipboard text of a paste event', () => {
    const result = serializeEvent({
      type: 'paste',
      clipboardData: { getData: () => 'pasted text' },
    });

    expect(result).toEqual({ type: 'paste', clipboardText: 'pasted text' });
  });

  it('should cap the forwarded clipboard text length', () => {
    const result = serializeEvent({
      type: 'paste',
      clipboardData: {
        getData: () => 'a'.repeat(MAX_SERIALIZED_EVENT_TEXT_LENGTH + 1),
      },
    });

    expect(result.clipboardText).toHaveLength(MAX_SERIALIZED_EVENT_TEXT_LENGTH);
  });

  it('should never read clipboard data on copy and cut events', () => {
    const getData = jest.fn(() => 'selected text');

    const copyResult = serializeEvent({
      type: 'copy',
      clipboardData: { getData },
    });
    const cutResult = serializeEvent({
      type: 'cut',
      clipboardData: { getData },
    });

    expect(getData).not.toHaveBeenCalled();
    expect(copyResult).toEqual({ type: 'copy' });
    expect(cutResult).toEqual({ type: 'cut' });
  });

  it('should ignore malformed clipboard data on paste', () => {
    expect(
      serializeEvent({ type: 'paste', clipboardData: 'not-an-object' }),
    ).toEqual({ type: 'paste' });
    expect(
      serializeEvent({ type: 'paste', clipboardData: { getData: 'x' } }),
    ).toEqual({ type: 'paste' });
    expect(
      serializeEvent({ type: 'paste', clipboardData: { getData: () => 1 } }),
    ).toEqual({ type: 'paste' });
  });

  it('should extract safe target properties', () => {
    const result = serializeEvent({
      type: 'change',
      target: { value: 'hello', checked: true, scrollTop: 5 },
    });

    expect(result).toMatchObject({
      type: 'change',
      value: 'hello',
      checked: true,
      scrollTop: 5,
    });
  });

  it.each(['keydown', 'keypress', 'beforeinput', 'pointerdown', 'paste'])(
    'should leave out form control state on %s, before the browser applies the change',
    (type) => {
      expect(
        serializeEvent({
          type,
          target: { value: 'before', checked: false, scrollTop: 5 },
        }),
      ).toEqual({ type, scrollTop: 5 });
    },
  );

  it.each(['change', 'click', 'blur', 'focusout'])(
    'should include form control state on %s, once the browser has applied the change',
    (type) => {
      expect(
        serializeEvent({ type, target: { value: 'after', checked: true } }),
      ).toEqual({ type, value: 'after', checked: true });
    },
  );

  it('should leave out form control state when another forward of the same native event already carried it', () => {
    expect(
      serializeEvent(
        {
          type: 'input',
          target: { value: 'after', checked: true, scrollTop: 5 },
        },
        { includesFormControlState: false },
      ),
    ).toEqual({ type: 'input', scrollTop: 5 });
  });

  it('should include the value but not the checked state on keyup, which precedes a space activation', () => {
    expect(
      serializeEvent({
        type: 'keyup',
        target: { value: 'typed', checked: false },
      }),
    ).toEqual({ type: 'keyup', value: 'typed' });
  });

  it('should include the value but not the checked state on input, which fires after React restores a controlled checkbox', () => {
    expect(
      serializeEvent({
        type: 'input',
        target: { value: 'on', checked: false },
      }),
    ).toEqual({ type: 'input', value: 'on' });
  });

  it('should include the muted state only once a volume change has applied it', () => {
    const video = { muted: true, currentTime: 3 };

    expect(serializeEvent({ type: 'click', target: video })).toEqual({
      type: 'click',
      currentTime: 3,
    });
    expect(serializeEvent({ type: 'volumechange', target: video })).toEqual({
      type: 'volumechange',
      muted: true,
      currentTime: 3,
    });
  });

  it('should serialize target files', () => {
    const result = serializeEvent({
      type: 'change',
      target: {
        files: {
          length: 1,
          0: {
            name: 'a.png',
            size: 1,
            type: 'image/png',
            lastModified: 1,
          },
        },
      },
    });

    expect(result.files).toEqual([
      { name: 'a.png', size: 1, type: 'image/png', lastModified: 1 },
    ]);
  });
});
