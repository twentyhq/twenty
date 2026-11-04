import { describe, expect, it, vi } from 'vitest';

import { type ComponentDocumentation } from '../../../../twenty-ui/docs/types';
import { renderUiDocumentation } from '../render-ui-documentation';

const component: ComponentDocumentation = {
  name: 'Card',
  slug: 'card',
  entryPoint: 'twenty-ui/primitives/surfaces',
  props: [],
  parts: [{ name: 'Root', props: [] }],
};
const guides = [
  {
    name: 'primitives/surfaces/card.mdx',
    content:
      "import API from '/snippets/ui/generated/card.mdx';\n<Card.Root />",
  },
  ...['getting-started', 'theming', 'icons', 'accessibility'].map((name) => ({
    name: `${name}.mdx`,
    content: `# ${name}`,
  })),
];

describe('UI documentation asset', () => {
  it('preserves the source guides, compound API and package version', () => {
    const result = JSON.parse(
      renderUiDocumentation({
        version: '1.0.0',
        components: [component],
        guides,
      }),
    );

    expect(result).toEqual({
      version: '1.0.0',
      pages: [
        {
          name: 'Card',
          entryPoint: component.entryPoint,
          content: guides[0].content,
          api: component,
        },
        ...guides.slice(1).map((guide) => ({
          name: guide.name.replace('.mdx', ''),
          content: guide.content,
        })),
      ],
    });
  });

  it('warns and skips missing guides while retaining available documentation', () => {
    const warning = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

    try {
      const result = JSON.parse(
        renderUiDocumentation({
          version: '1.0.0',
          components: [
            component,
            { ...component, name: 'Missing', slug: 'missing' },
          ],
          guides: guides.filter((guide) => guide.name !== 'theming.mdx'),
        }),
      );

      expect(result.pages.map((page: { name: string }) => page.name)).toEqual([
        'Card',
        'getting-started',
        'icons',
        'accessibility',
      ]);
      expect(warning).toHaveBeenCalledWith(
        'Skipping UI documentation for Missing: guide missing.\n',
      );
      expect(warning).toHaveBeenCalledWith(
        'Skipping UI documentation for theming: guide missing.\n',
      );
    } finally {
      warning.mockRestore();
    }
  });
});
