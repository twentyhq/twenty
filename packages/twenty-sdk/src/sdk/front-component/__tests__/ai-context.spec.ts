import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

import { buildAiFrontComponentContext } from '../../../../scripts/build-ai-front-component-context';

it('keeps the AI builder runtime and declarations aligned with the SDK hooks', async () => {
  const contextModule = JSON.parse(
    readFileSync(
      resolve(
        __dirname,
        '../../../../../twenty-server/src/engine/metadata-modules/ai/ai-front-component/constants/generated/front-component-context-module.json',
      ),
      'utf8',
    ),
  );

  expect(await buildAiFrontComponentContext()).toEqual(contextModule);
}, 30000);
