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
