import { getEffectiveUiScale } from '@/ui/theme/utils/getEffectiveUiScale';

describe('getEffectiveUiScale', () => {
  it('follows the workspace scale when the member kept the default', () => {
    expect(
      getEffectiveUiScale({
        memberUiScale: 'Default',
        workspaceUiScale: 'Large',
      }),
    ).toBe('Large');
  });

  it('keeps the member choice over the workspace scale', () => {
    expect(
      getEffectiveUiScale({
        memberUiScale: 'Large',
        workspaceUiScale: 'Normal',
      }),
    ).toBe('Large');
    expect(
      getEffectiveUiScale({
        memberUiScale: 'Smaller',
        workspaceUiScale: 'Large',
      }),
    ).toBe('Smaller');
  });

  it('falls back to the member value when the workspace scale is unknown', () => {
    expect(
      getEffectiveUiScale({
        memberUiScale: 'Default',
        workspaceUiScale: undefined,
      }),
    ).toBe('Default');
    expect(
      getEffectiveUiScale({
        memberUiScale: 'Default',
        workspaceUiScale: 'Huge',
      }),
    ).toBe('Default');
  });
});
