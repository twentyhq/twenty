import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const PLAYBOOK_NAV_SOURCE = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), './playbook-nav.ts'),
  'utf8',
);

describe('runPlaybookNav', () => {
  it('does not open Apply from a standalone playbook page', () => {
    expect(PLAYBOOK_NAV_SOURCE).not.toContain('APPLY_TO_BRIEF');
    expect(PLAYBOOK_NAV_SOURCE).not.toContain('openSidePanelPage');
    expect(PLAYBOOK_NAV_SOURCE).not.toMatch(/'apply'/);
  });
});
