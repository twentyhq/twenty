import { describe, expect, it } from 'vitest';

import { getSpeakerNameMatchKeys } from 'src/front-components/utils/get-speaker-name-match-keys.util';

describe('getSpeakerNameMatchKeys', () => {
  it('matches transcript full names to compact calendar aliases', () => {
    expect(getSpeakerNameMatchKeys('Martin Muller')).toContain('martmull');
    expect(getSpeakerNameMatchKeys('Martmull92')).toContain('martmull');
  });

  it('keeps exact normalized full names available for regular participant names', () => {
    expect(getSpeakerNameMatchKeys('Nitin Koche')).toEqual([
      'nitin koche',
      'nitinkoche',
      'nitikoch',
    ]);
  });

  it('folds accents before generating compact match keys', () => {
    expect(getSpeakerNameMatchKeys('Martin Müller')).toContain('martmull');
  });
});
