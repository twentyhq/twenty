import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { collectFrontComponentStrings } from '@/app/translations/collect-front-component-strings';

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

const writeFrontComponent = async (source: string): Promise<string> => {
  const dir = await mkdtemp(join(tmpdir(), 'twenty-fc-translations-'));
  directories.push(dir);
  const filePath = join(dir, 'my.front-component.tsx');

  await writeFile(filePath, source);

  return filePath;
};

describe('collectFrontComponentStrings', () => {
  it('returns nothing when there are no source files', async () => {
    expect(await collectFrontComponentStrings([])).toEqual([]);
  });

  it('extracts t(), msg() and <Trans> static strings with context', async () => {
    const filePath = await writeFrontComponent(`
      import { t, msg, Trans, useTranslate } from 'twenty-sdk/front-component';

      const STATUS = msg('Draft');

      const Component = () => {
        const { t: translate } = useTranslate();

        const label = t('No content yet');
        const verb = t({ message: 'Open', context: 'door' });

        return (
          <div title={label}>
            <Trans>Welcome back</Trans>
            <Trans context="card">Untitled</Trans>
            <Trans message="Hi {name}" values={{ name: 'Ada' }} />
            <span>{translate(STATUS)}</span>
          </div>
        );
      };

      export default defineFrontComponent({ component: Component });
    `);

    const result = await collectFrontComponentStrings([filePath]);

    expect(result).toEqual(
      expect.arrayContaining([
        { message: 'Draft' },
        { message: 'No content yet' },
        { message: 'Open', context: 'door' },
        { message: 'Welcome back' },
        { message: 'Untitled', context: 'card' },
        { message: 'Hi {name}' },
      ]),
    );
    expect(result).toHaveLength(6);
  });

  it('collapses whitespace in multi-line <Trans> static text', async () => {
    const filePath = await writeFrontComponent(`
      import { Trans } from 'twenty-sdk/front-component';

      const Component = () => (
        <p>
          <Trans>
            Welcome
            back
          </Trans>
        </p>
      );

      export default defineFrontComponent({ component: Component });
    `);

    expect(await collectFrontComponentStrings([filePath])).toEqual([
      { message: 'Welcome back' },
    ]);
  });

  it('skips dynamic arguments and interpolated children that cannot be statically extracted', async () => {
    const filePath = await writeFrontComponent(`
      import { t, Trans } from 'twenty-sdk/front-component';

      const Component = ({ name }: { name: string }) => {
        const dynamic = t(name);

        return (
          <div title={dynamic}>
            <Trans>Hello {name}</Trans>
          </div>
        );
      };

      export default defineFrontComponent({ component: Component });
    `);

    expect(await collectFrontComponentStrings([filePath])).toEqual([]);
  });

  it('dedupes identical message/context pairs across files', async () => {
    const first = await writeFrontComponent(`
      import { t } from 'twenty-sdk/front-component';
      export const a = () => t('Save');
    `);
    const second = await writeFrontComponent(`
      import { t } from 'twenty-sdk/front-component';
      export const b = () => t('Save');
    `);

    expect(await collectFrontComponentStrings([first, second])).toEqual([
      { message: 'Save' },
    ]);
  });
  it('visits nested calls and JSX children even when their parent cannot be extracted', async () => {
    const filePath = await writeFrontComponent(`
      t(wrap(msg('Nested call')));
      <Trans>{msg('Nested expression')}</Trans>;
      <Trans><Trans>Nested element</Trans></Trans>;
      <div><Trans message={'Static attribute'} context={'card'} /></div>;
    `);
    expect(await collectFrontComponentStrings([filePath])).toEqual([
      { message: 'Nested call' },
      { message: 'Nested expression' },
      { message: 'Nested element' },
      { message: 'Static attribute', context: 'card' },
    ]);
  });

  it('uses identifier keys and the first matching property in message descriptors', async () => {
    const filePath = await writeFrontComponent(String.raw`
      t({ 'message': 'Quoted' });
      t({ ['message']: 'Computed' });
      t({ message, message: 'Later property' });
      t({ get message() { return 'Getter'; }, message: 'Later property' });
      t({ message: 'First property', message: 'Later property' });
      t({ \u006dessage: 'Escaped name' });
      \u0074('Escaped callee');
    `);
    expect(await collectFrontComponentStrings([filePath])).toEqual([
      { message: 'First property' },
      { message: 'Escaped name' },
      { message: 'Escaped callee' },
    ]);
  });
});
