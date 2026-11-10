import { resolveViewFamilyLoadOutcome } from '@/metadata-store/utils/resolveViewFamilyLoadOutcome';

describe('resolveViewFamilyLoadOutcome', () => {
  it('commits when every response and the hint agree', () => {
    expect(
      resolveViewFamilyLoadOutcome({
        familyVersions: ['h1', 'h1', 'h1', 'h1'],
        hasEpochChanged: false,
        hint: 'h1',
      }),
    ).toEqual({ type: 'commit', familyVersion: 'h1' });
  });

  it('refuses a load where a lagging pod answered with an older generation', () => {
    expect(
      resolveViewFamilyLoadOutcome({
        familyVersions: ['h1', 'h0', 'h1', 'h1'],
        hasEpochChanged: false,
        hint: 'h1',
      }),
    ).toEqual({ type: 'mismatch' });
  });

  it('refuses a load that an event or removal superseded', () => {
    expect(
      resolveViewFamilyLoadOutcome({
        familyVersions: ['h1', 'h1'],
        hasEpochChanged: true,
        hint: 'h1',
      }),
    ).toEqual({ type: 'mismatch' });
  });

  it('asks to confirm the hint when responses agree on another version', () => {
    expect(
      resolveViewFamilyLoadOutcome({
        familyVersions: ['h2', 'h2'],
        hasEpochChanged: false,
        hint: 'h1',
      }),
    ).toEqual({ type: 'confirm-hint', familyVersion: 'h2' });
  });

  it('asks to confirm when the hint is unknown', () => {
    expect(
      resolveViewFamilyLoadOutcome({
        familyVersions: ['h1'],
        hasEpochChanged: false,
        hint: undefined,
      }),
    ).toEqual({ type: 'confirm-hint', familyVersion: 'h1' });
  });

  it('refuses an empty load', () => {
    expect(
      resolveViewFamilyLoadOutcome({
        familyVersions: [],
        hasEpochChanged: false,
        hint: 'h1',
      }),
    ).toEqual({ type: 'mismatch' });
  });
});
