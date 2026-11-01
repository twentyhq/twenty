import { globSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FRONT_COMPONENT_UI_IMPORTS } from 'twenty-shared/front-component-build';

const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const documentationRoot = resolve(serverRoot, '../twenty-docs/ui');
const uiRoot = resolve(serverRoot, '../twenty-ui');
const { version } = JSON.parse(
  await readFile(resolve(uiRoot, 'package.json'), 'utf8'),
);
const components = JSON.parse(
  await readFile(resolve(uiRoot, 'generated/components.docs.json'), 'utf8'),
);
const guides = await Promise.all(
  globSync('**/*.mdx', { cwd: documentationRoot })
    .sort()
    .map(async (name) => ({
      name,
      content: await readFile(resolve(documentationRoot, name), 'utf8'),
    })),
);
const pages = components
  .filter((component) =>
    FRONT_COMPONENT_UI_IMPORTS.includes(component.entryPoint),
  )
  .map((component) => {
    const guide = guides.find(({ content }) =>
      content.includes(`/snippets/ui/generated/${component.slug}.mdx`),
    );

    if (!guide) {
      throw new Error(`Missing UI guide for ${component.name}`);
    }

    return {
      name: component.name,
      entryPoint: component.entryPoint,
      content: guide.content,
      api: component,
    };
  });

for (const name of ['getting-started', 'theming', 'icons', 'accessibility']) {
  pages.push({
    name,
    content: await readFile(resolve(documentationRoot, `${name}.mdx`), 'utf8'),
  });
}

const output = resolve(
  serverRoot,
  'src/engine/metadata-modules/ai/ai-front-component/constants/ui-documentation.generated.json',
);

await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify({ version, pages }));
