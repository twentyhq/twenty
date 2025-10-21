import { type ObjectRecord } from 'twenty-shared/types';

import { getValueFromPath } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/get-value-from-path.util';

describe('getValueFromPath', () => {
  const baseRecord: Partial<ObjectRecord> = {
    id: 'recordId',
    name: 'John Doe',
    parent: { child: 'nested-value', empty: '' },
    emailsField: { primaryEmail: 'john@example.com' },
  };

  it('returns direct field value for single-level path', () => {
    const value = getValueFromPath(baseRecord, 'name');

    expect(value).toBe('John Doe');
  });

  it('returns nested value for two-level path', () => {
    const value = getValueFromPath(baseRecord, 'parent.child');

    expect(value).toBe('nested-value');
  });

  it('returns undefined when parent field does not exist', () => {
    const value = getValueFromPath(baseRecord, 'missing.child');

    expect(value).toBeUndefined();
  });

  it('returns undefined when child field does not exist on existing parent', () => {
    const value = getValueFromPath(baseRecord, 'parent.missing');

    expect(value).toBeUndefined();
  });
});
