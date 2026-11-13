import { computeViewFieldSettingsWithLabel } from '@/views/utils/computeViewFieldSettingsWithLabel';

describe('computeViewFieldSettingsWithLabel', () => {
  it('sets a trimmed label', () => {
    expect(
      computeViewFieldSettingsWithLabel({
        settings: null,
        label: '  Next step ',
      }),
    ).toEqual({ label: 'Next step' });
  });

  it('keeps the record limit when the label changes', () => {
    expect(
      computeViewFieldSettingsWithLabel({
        settings: { label: 'Next step', recordLimit: 1 },
        label: 'Upcoming step',
      }),
    ).toEqual({ label: 'Upcoming step', recordLimit: 1 });
  });

  it('removes the label when it is cleared', () => {
    expect(
      computeViewFieldSettingsWithLabel({
        settings: { label: 'Next step', recordLimit: 1 },
        label: '   ',
      }),
    ).toEqual({ recordLimit: 1 });
  });

  it('returns null when nothing is left to store', () => {
    expect(
      computeViewFieldSettingsWithLabel({
        settings: { label: 'Next step' },
        label: '',
      }),
    ).toBeNull();
  });
});
