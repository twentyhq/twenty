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
