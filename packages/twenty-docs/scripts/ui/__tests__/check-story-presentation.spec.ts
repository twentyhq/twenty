import { describe, expect, it } from 'vitest';

import { checkStoryPresentation } from '../check-story-presentation.mjs';

describe('documentation story presentation', () => {
  it('accepts shared render and args without inheriting interaction tests', () => {
    expect(
      checkStoryPresentation({
        content: `
        const meta = { title: 'Preview' } satisfies Meta;
        export default meta;
        export const Interaction = { args: {}, render: () => null, play: async () => {} };
        export const Documentation = { args: Interaction.args, render: Interaction.render };
      `,
        exportName: 'Documentation',
      }),
    ).toEqual([]);
  });

  it.each([
    'export default { play: async () => {} }; export const Documentation = {};',
    'const base = { play: async () => {} }; export const Documentation = { ...base };',
    'export const Documentation = { play: undefined };',
    'export const Documentation = {}; Documentation.play = async () => {};',
  ])('rejects direct, inherited, or assigned play in %s', (content) => {
    expect(
      checkStoryPresentation({ content, exportName: 'Documentation' }),
    ).toContain(
      'Documentation stories must not define or inherit a play function.',
    );
  });

  it('reports imported spreads that cannot be checked locally', () => {
    expect(
      checkStoryPresentation({
        content:
          "import { base } from './base'; export const Documentation = { ...base };",
        exportName: 'Documentation',
      }),
    ).toEqual([
      'Cannot verify the imported or unresolved story definition "base".',
    ]);
  });
});
