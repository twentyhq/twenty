import { isUndefined } from '@sniptt/guards';

import { type ComponentDocumentation } from '../../../twenty-ui/docs/types';

export const renderUiDocumentation = ({
  version,
  components,
  guides,
}: {
  version: string;
  components: ComponentDocumentation[];
  guides: { name: string; content: string }[];
}): string => {
  const pages: {
    name: string;
    entryPoint?: string;
    content: string;
    api?: ComponentDocumentation;
  }[] = components.flatMap((component) => {
    const guide = guides.find(({ content }) =>
      content.includes(`/snippets/ui/generated/${component.slug}.mdx`),
    );

    if (isUndefined(guide)) {
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

    if (isUndefined(guide)) {
      process.stderr.write(
        `Skipping UI documentation for ${name}: guide missing.\n`,
      );
      continue;
    }

    pages.push({ name, content: guide.content });
  }

  return `${JSON.stringify({ version, pages })}\n`;
};
