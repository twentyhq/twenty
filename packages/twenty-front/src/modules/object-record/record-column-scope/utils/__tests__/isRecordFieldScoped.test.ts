import { isRecordFieldScoped } from '@/object-record/record-column-scope/utils/isRecordFieldScoped';

describe('isRecordFieldScoped', () => {
  it('is scoped by a scope view or a record limit', () => {
    expect(
      isRecordFieldScoped({
        recordField: { settings: null },
        scopeView: { id: '20202020-0000-4000-8000-000000000001' },
      }),
    ).toBe(true);
    expect(
      isRecordFieldScoped({
        recordField: { settings: { recordLimit: 1 } },
        scopeView: undefined,
      }),
    ).toBe(true);
  });

  it('is not scoped by a label alone', () => {
    expect(
      isRecordFieldScoped({
        recordField: { settings: { label: 'Next step' } },
        scopeView: undefined,
      }),
    ).toBe(false);
  });
});
