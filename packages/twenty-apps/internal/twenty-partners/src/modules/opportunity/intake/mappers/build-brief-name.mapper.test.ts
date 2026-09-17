import { describe, expect, it } from 'vitest';

import { buildBriefName } from './build-brief-name.mapper';

describe('buildBriefName', () => {
  it('names the brief after the need', () => {
    expect(buildBriefName('  Migrate from HubSpot ')).toBe(
      'Migrate from HubSpot — marketplace brief',
    );
  });

  it('shortens a long need', () => {
    const name = buildBriefName(`${'a'.repeat(59)} ${'b'.repeat(40)}`);
    expect(name).toBe(`${'a'.repeat(59)}… — marketplace brief`);
  });
});
