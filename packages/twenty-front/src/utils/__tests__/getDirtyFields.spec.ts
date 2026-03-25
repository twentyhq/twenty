import { getDirtyFields } from '~/utils/getDirtyFields';

describe('getDirtyFields', () => {
  it('should return all defined fields from draft when persisted is null', () => {
    const draft = { a: 1, b: 'hello', c: undefined, d: null };
    const persisted = null;
    expect(getDirtyFields(draft, persisted)).toEqual({
      a: 1,
      b: 'hello',
      d: null,
    });
  });

  it('should return all defined fields from draft when persisted is undefined', () => {
    const draft = { a: 1, b: 'hello', c: undefined, d: false };
    const persisted = undefined;
    expect(getDirtyFields(draft, persisted)).toEqual({
      a: 1,
      b: 'hello',
      d: false,
    });
  });

  it('should return an empty object when draft and persisted are identical', () => {
    const draft = { a: 1, b: { c: 2 }, d: [1, 2] };
    const persisted = { a: 1, b: { c: 2 }, d: [1, 2] };
    expect(getDirtyFields(draft, persisted)).toEqual({});
  });

  it('should detect simple value changes', () => {
    const draft = { a: 1, b: 'world', c: true };
    const persisted = { a: 1, b: 'hello', c: false };
    expect(getDirtyFields(draft, persisted)).toEqual({ b: 'world', c: true });
  });

  it('should detect nested object changes', () => {
    const draft = { a: { b: { c: 3 } } };
    const persisted = { a: { b: { c: 2 } } };
    expect(getDirtyFields(draft, persisted)).toEqual({ a: { b: { c: 3 } } });
  });

  it('should detect array changes', () => {
    const draft = { a: [1, 3] };
    const persisted = { a: [1, 2] };
    expect(getDirtyFields(draft, persisted)).toEqual({ a: [1, 3] });
  });

  it('should detect added fields', () => {
    const draft = { a: 1, b: 2 };
    const persisted = { a: 1 };
    expect(getDirtyFields(draft, persisted)).toEqual({ b: 2 });
  });

  it('should detect removed fields (value becomes undefined)', () => {
    const draft = { a: 1 };
    const persisted = { a: 1, b: 2 };
    // When a field is removed, its value in draft effectively becomes undefined
    // Cast persisted to any to satisfy TS in this test scenario
    expect(getDirtyFields(draft, persisted as any)).toEqual({ b: undefined });
  });

  it('should detect fields set to undefined', () => {
    const draft = { a: 1, b: undefined };
    const persisted = { a: 1, b: 2 };
    // Cast persisted to any to satisfy TS in this test scenario
    expect(getDirtyFields(draft, persisted as any)).toEqual({ b: undefined });
  });

  it('should detect fields set to null', () => {
    const draft = { a: 1, b: null };
    const persisted = { a: 1, b: 2 };
    // Cast persisted to any to satisfy TS in this test scenario
    expect(getDirtyFields(draft, persisted as any)).toEqual({ b: null });
  });

  it('should handle complex nested structures with mixed changes', () => {
    const draft = {
      id: 1,
      name: 'new name', // changed
      details: {
        status: 'active', // same
        tags: ['tag1', 'tag3'], // changed
        metadata: { key: 'newValue' }, // changed
      },
      settings: { enabled: true }, // new
    };
    const persisted = {
      id: 1,
      name: 'old name',
      details: {
        status: 'active',
        tags: ['tag1', 'tag2'],
        metadata: { key: 'oldValue' },
      },
      archived: true, // removed
    };
    // Cast persisted to any to satisfy TS in this test scenario
    expect(getDirtyFields(draft, persisted as any)).toEqual({
      name: 'new name',
      details: {
        status: 'active',
        tags: ['tag1', 'tag3'],
        metadata: { key: 'newValue' },
      },
      settings: { enabled: true },
      archived: undefined,
    });
  });

  it('should return empty object for deeply equal but different reference objects', () => {
    const draft = { a: { b: 1 } };
    const persisted = JSON.parse(JSON.stringify(draft)); // Deep clone, different reference
    expect(getDirtyFields(draft, persisted)).toEqual({});
  });
});
