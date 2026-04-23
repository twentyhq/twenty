import { getDirtyFields } from '~/utils/getDirtyFields';

describe('getDirtyFields', () => {
  it('should return all defined fields when persisted is null', () => {
    const draft = { name: 'Alice', age: 30, email: undefined };

    const result = getDirtyFields(draft, null);

    expect(result).toEqual({ name: 'Alice', age: 30 });
  });

  it('should return all defined fields when persisted is undefined', () => {
    const draft = { name: 'Bob' };

    const result = getDirtyFields(draft, undefined);

    expect(result).toEqual({ name: 'Bob' });
  });

  it('should return only changed fields', () => {
    const draft = { name: 'Alice', age: 31 };
    const persisted = { name: 'Alice', age: 30 };

    const result = getDirtyFields(draft, persisted);

    expect(result).toEqual({ age: 31 });
  });

  it('should return empty object when nothing changed', () => {
    const draft = { name: 'Alice', age: 30 };
    const persisted = { name: 'Alice', age: 30 };

    const result = getDirtyFields(draft, persisted);

    expect(result).toEqual({});
  });

  it('should detect deeply nested changes', () => {
    const draft = { address: { city: 'Paris' } };
    const persisted = { address: { city: 'London' } };

    const result = getDirtyFields(draft, persisted);

    expect(result).toEqual({ address: { city: 'Paris' } });
  });

  it('should detect new keys in draft', () => {
    const draft = { name: 'Alice', age: 30 } as Record<string, any>;
    const persisted = { name: 'Alice' } as Record<string, any>;

    const result = getDirtyFields(draft, persisted);

    expect(result).toEqual({ age: 30 });
  });
});
