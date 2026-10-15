import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { type Manifest } from 'twenty-shared/application';
import { generateMessageId } from 'twenty-shared/i18n';
import { expect, it } from 'vitest';

import { collectTranslationLabels } from '@/app/translations/collect-translation-labels';

it('keeps readable labels for component, contextual and emptied catalog entries without source files', async () => {
  const appPath = await mkdtemp(join(tmpdir(), 'translation-labels-'));
  try {
    await mkdir(join(appPath, 'locales'));
    await writeFile(
      join(appPath, 'locales/fr-FR.json'),
      JSON.stringify({
        Hello: 'Bonjour',
        Emptied: '',
        'pageLayout.name': { Something: 'Quelque chose' },
      }),
    );
    const labels = await collectTranslationLabels({
      appPath,
      manifest: {} as Manifest,
    });
    expect(labels).toEqual({
      [generateMessageId('Hello')]: '"Hello"',
      [generateMessageId('Emptied')]: '"Emptied"',
      [generateMessageId('Something', 'pageLayout.name')]:
        'pageLayout.name["Something"]',
    });
  } finally {
    await rm(appPath, { recursive: true, force: true });
  }
});

it.each(['invalid json', 'null', '[]'])(
  'reports the failing locale path for an invalid catalog: %s',
  async (content) => {
    const appPath = await mkdtemp(join(tmpdir(), 'translation-labels-'));
    const localePath = join(appPath, 'locales/fr-FR.json');
    try {
      await mkdir(join(appPath, 'locales'));
      await writeFile(localePath, content);
      await expect(
        collectTranslationLabels({ appPath, manifest: {} as Manifest }),
      ).rejects.toThrow(`Could not read translation labels from ${localePath}`);
    } finally {
      await rm(appPath, { recursive: true, force: true });
    }
  },
);
