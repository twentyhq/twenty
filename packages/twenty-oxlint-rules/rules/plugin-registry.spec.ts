import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import plugin from '../oxlint-plugin';

const RULES_DIRECTORY = join(import.meta.dirname, '.');

const getRuleModuleFileNames = () =>
  readdirSync(RULES_DIRECTORY).filter(
    (fileName) => fileName.endsWith('.ts') && !fileName.endsWith('.spec.ts'),
  );

describe('oxlint plugin registry', () => {
  it('registers every rule module', async () => {
    const unregistered: string[] = [];

    for (const fileName of getRuleModuleFileNames()) {
      const module = await import(join(RULES_DIRECTORY, fileName));

      if (module.RULE_NAME === undefined) {
        continue;
      }

      if (plugin.rules[module.RULE_NAME] === undefined) {
        unregistered.push(`${fileName} (${module.RULE_NAME})`);
      }
    }

    expect(unregistered).toEqual([]);
  });
});
