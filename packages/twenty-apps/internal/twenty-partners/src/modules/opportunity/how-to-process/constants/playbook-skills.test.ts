import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { PLAYBOOK_SKILLS } from './playbook-skills';

const SKILLS_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../skills',
);

describe('PLAYBOOK_SKILLS', () => {
  it('points each GitHub URL at a SKILL.md that exists in this app', () => {
    for (const skill of PLAYBOOK_SKILLS) {
      expect(existsSync(resolve(SKILLS_ROOT, skill.name, 'SKILL.md'))).toBe(
        true,
      );
      expect(skill.githubUrl).toBe(
        `https://github.com/twentyhq/twenty/blob/main/packages/twenty-apps/internal/twenty-partners/src/skills/${skill.name}/SKILL.md`,
      );
    }
  });
});
