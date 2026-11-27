import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

import { buildAiFrontComponentSdk } from '../../../../scripts/build-ai-front-component-sdk';

it('keeps the AI builder runtime and declarations aligned with the public SDK entry point', async () => {
  const contextModule = JSON.parse(
    readFileSync(
      resolve(
        __dirname,
        '../../../../../twenty-server/src/engine/metadata-modules/ai/ai-front-component/constants/generated/front-component-sdk-module.json',
      ),
      'utf8',
    ),
  );

  expect(await buildAiFrontComponentSdk()).toEqual(contextModule);
}, 30000);
