import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const AGENTS_MD = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../AGENTS.md'),
  'utf8',
);

describe('AGENTS.md opportunity playbooks', () => {
  it('requires lockstep updates for How to process and How to apply', () => {
    expect(AGENTS_MD).toContain('How to process');
    expect(AGENTS_MD).toContain('How to apply');
    expect(AGENTS_MD).toContain('lockstep');
    expect(AGENTS_MD).toContain('Open Briefs');
    expect(AGENTS_MD).toContain('My Applications');
    expect(AGENTS_MD).toMatch(/operator language/i);
    expect(AGENTS_MD).toContain('twenty-lead-brief');
    expect(AGENTS_MD).toContain('GitHub');
    expect(AGENTS_MD).toContain('Twenty Internal');
    expect(AGENTS_MD).toContain('MCP');
    expect(AGENTS_MD).toMatch(/Do not open Apply/);
  });
});
