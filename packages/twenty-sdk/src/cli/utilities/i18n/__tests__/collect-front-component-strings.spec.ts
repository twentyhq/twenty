import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { collectFrontComponentStrings } from '@/cli/utilities/i18n/collect-front-component-strings';

const writeFrontComponent = async (source: string): Promise<string> => {
  const dir = await mkdtemp(join(tmpdir(), 'twenty-fc-i18n-'));
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
      import { t, msg, Trans, useLingui } from 'twenty-sdk/front-component';

      const STATUS = msg('Draft');

      const Component = () => {
        const { t: translate } = useLingui();

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
});
