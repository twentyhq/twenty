import { describe, expect, it } from 'vitest';

import { detectOutputMode } from '@/output/detect-output-mode';

describe('detectOutputMode', () => {
  it('defaults to human output', () => {
    expect(detectOutputMode(['version'])).toBe('human');
  });

  it('selects JSON with --json or --format json in either spelling', () => {
    expect(detectOutputMode(['version', '--json'])).toBe('json');
    expect(detectOutputMode(['--format', 'json', 'version'])).toBe('json');
    expect(detectOutputMode(['version', '--format=json'])).toBe('json');
  });

  it('selects NDJSON with --format ndjson', () => {
    expect(detectOutputMode(['--format=ndjson', 'version'])).toBe('ndjson');
  });

  it('uses the last --format value, like the option parser', () => {
    expect(
      detectOutputMode(['version', '--format', 'human', '--format', 'json']),
    ).toBe('json');
    expect(
      detectOutputMode(['version', '--format=json', '--format=human']),
    ).toBe('human');
    expect(
      detectOutputMode(['version', '--format=ndjson', '--format', 'json']),
    ).toBe('json');
  });

  it('ignores arguments after --', () => {
    expect(detectOutputMode(['api', '--', '--json'])).toBe('human');
  });
});
