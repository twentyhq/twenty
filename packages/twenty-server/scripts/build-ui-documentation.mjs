import { globSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FRONT_COMPONENT_UI_IMPORTS } from 'twenty-shared/front-component-build';
import { isDefined } from 'twenty-shared/utils';

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
  .flatMap((component) => {
    const guide = guides.find(({ content }) =>
      content.includes(`/snippets/ui/generated/${component.slug}.mdx`),
    );

    if (!isDefined(guide)) {
      process.stderr.write(
        `Skipping UI documentation for ${component.name}: guide missing.\n`,
      );
      return [];
    }

    return [
      {
        name: component.name,
        entryPoint: component.entryPoint,
        content: guide.content,
        api: component,
      },
    ];
  });

for (const name of ['getting-started', 'theming', 'icons', 'accessibility']) {
  const guide = guides.find((guide) => guide.name === `${name}.mdx`);
  if (!isDefined(guide)) {
    process.stderr.write(
      `Skipping UI documentation for ${name}: guide missing.\n`,
    );
    continue;
  }
  pages.push({ name, content: guide.content });
}

const output = resolve(
  serverRoot,
  'src/engine/metadata-modules/ai/ai-front-component/constants/ui-documentation.generated.json',
);

await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify({ version, pages }));
