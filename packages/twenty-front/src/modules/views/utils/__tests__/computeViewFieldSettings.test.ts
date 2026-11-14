import { computeViewFieldSettings } from '@/views/utils/computeViewFieldSettings';

describe('computeViewFieldSettings', () => {
  it('stores a trimmed label and a record limit', () => {
    expect(
      computeViewFieldSettings({ label: '  Next step ', recordLimit: '1' }),
    ).toEqual({ label: 'Next step', recordLimit: 1 });
  });

  it('leaves out a cleared label', () => {
    expect(
      computeViewFieldSettings({ label: '   ', recordLimit: '3' }),
    ).toEqual({ recordLimit: 3 });
  });

  it.each(['', '0', '-2', 'abc', '12abc', '61'])(
    'leaves out record limit %j',
    (recordLimit) => {
      expect(
        computeViewFieldSettings({ label: 'Next step', recordLimit }),
      ).toEqual({ label: 'Next step' });
    },
  );

  it('returns null when nothing is left to store', () => {
    expect(computeViewFieldSettings({ label: '', recordLimit: '' })).toBeNull();
  });
});
