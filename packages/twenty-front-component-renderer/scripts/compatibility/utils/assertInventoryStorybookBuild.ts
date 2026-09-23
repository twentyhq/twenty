import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { getBuiltStoryComponentPathForRender } from '../../../src/__stories__/utils/getBuiltStoryComponentPathForRender';
import { INVENTORY_FIXTURE_PROTOCOL } from '../constants/INVENTORY_FIXTURE_PROTOCOL';
import { inventorySandboxRuntimeSchema } from '../schemas/inventorySandboxRuntimeSchema';
import { storybookIndexSchema } from '../schemas/storybookIndexSchema';

const REBUILD_HINT =
  'Run npx nx run twenty-front-component-renderer:compatibility:audit to rebuild it.';

const readStorybookIndex = async (directory: string) => {
  try {
    return await readFile(resolve(directory, 'index.json'), 'utf8');
  } catch {
    throw new Error(
      `No Storybook build found in ${directory}. ${REBUILD_HINT}`,
    );
  }
};

export const assertInventoryStorybookBuild = async (directory: string) => {
  const { entries } = storybookIndexSchema.parse(
    JSON.parse(await readStorybookIndex(directory)),
  );
  for (const runtime of inventorySandboxRuntimeSchema.options) {
    const storyId = `${INVENTORY_FIXTURE_PROTOCOL.storyIdPrefix}${runtime}`;
    if (!(storyId in entries)) {
      throw new Error(
        `The Storybook build in ${directory} has no ${storyId} story. ${REBUILD_HINT}`,
      );
    }
    const { pathname: fixturePathname } = new URL(
      getBuiltStoryComponentPathForRender(
        INVENTORY_FIXTURE_PROTOCOL.componentName,
        runtime,
      ),
      'http://localhost',
    );
    const fixturePath = resolve(directory, `.${fixturePathname}`);
    try {
      await access(fixturePath);
    } catch {
      throw new Error(
        `The Storybook build in ${directory} has no ${runtime} inventory fixture. ${REBUILD_HINT}`,
      );
    }
  }
};
