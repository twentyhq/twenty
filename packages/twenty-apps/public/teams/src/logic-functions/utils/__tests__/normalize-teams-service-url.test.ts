import { describe, expect, it } from 'vitest';

import { normalizeTeamsServiceUrl } from 'src/logic-functions/utils/normalize-teams-service-url';

describe('normalizeTeamsServiceUrl', () => {
  it('should strip trailing slashes', () => {
    expect(normalizeTeamsServiceUrl('https://smba.example/amer/')).toBe(
      'https://smba.example/amer',
    );
  });

  it('should strip repeated trailing slashes and surrounding whitespace', () => {
    expect(normalizeTeamsServiceUrl('  https://smba.example///  ')).toBe(
      'https://smba.example',
    );
  });

  it('should leave an already normalized url untouched', () => {
    expect(normalizeTeamsServiceUrl('https://smba.example/amer')).toBe(
      'https://smba.example/amer',
    );
  });
});
