import { getRecordFieldCustomLabel } from '@/object-record/record-field/utils/getRecordFieldCustomLabel';

const DEFAULT_LABEL = 'Tasks · Filtered';

describe('getRecordFieldCustomLabel', () => {
  it('keeps a renamed label without its surrounding spaces', () => {
    expect(
      getRecordFieldCustomLabel({
        editedLabel: '  Open tasks ',
        defaultLabel: DEFAULT_LABEL,
      }),
    ).toBe('Open tasks');
  });

  it('collapses repeated spaces like the server does', () => {
    expect(
      getRecordFieldCustomLabel({
        editedLabel: 'Open   tasks',
        defaultLabel: DEFAULT_LABEL,
      }),
    ).toBe('Open tasks');
  });

  it('drops an emptied label so the default label shows again', () => {
    expect(
      getRecordFieldCustomLabel({
        editedLabel: '   ',
        defaultLabel: DEFAULT_LABEL,
      }),
    ).toBeNull();
  });

  it('drops a label set back to the default label', () => {
    expect(
      getRecordFieldCustomLabel({
        editedLabel: DEFAULT_LABEL,
        defaultLabel: DEFAULT_LABEL,
      }),
    ).toBeNull();
  });
});
