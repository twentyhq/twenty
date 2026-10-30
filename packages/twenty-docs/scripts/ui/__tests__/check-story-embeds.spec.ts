import { describe, expect, it } from 'vitest';

import { checkStoryEmbeds } from '../check-story-embeds.mjs';

const storyIds = new Set([
  'ui-input-input--default',
  'ui-input-input--display',
]);

describe('checkStoryEmbeds', () => {
  it('requires a preview on a component guide', () => {
    expect(
      checkStoryEmbeds({ content: '# Input', storyIds, requireDisplay: true }),
    ).toEqual(['Component guides must include a Display story preview.']);
  });

  it('requires Display before catalogs and focused examples', () => {
    expect(
      checkStoryEmbeds({
        content: `<StoryEmbed storyId="ui-input-input--default" title="Input states" />
<StoryEmbed storyId="ui-input-input--display" title="Input example" />`,
        storyIds,
        displayStoryIds: new Set(['ui-input-input--display']),
        requireDisplay: true,
      }),
    ).toEqual([
      'Line 1: The first component preview must use a story exported as Display.',
    ]);
  });

  it('accepts Display followed by a focused example', () => {
    expect(
      checkStoryEmbeds({
        content: `<StoryEmbed storyId="ui-input-input--display" title="Input example" />
<StoryEmbed storyId="ui-input-input--default" title="Input states" />`,
        storyIds,
        displayStoryIds: new Set(['ui-input-input--display']),
        requireDisplay: true,
      }),
    ).toEqual([]);
  });

  it('uses the story index export name rather than trusting a display suffix', () => {
    expect(
      checkStoryEmbeds({
        content:
          '<StoryEmbed storyId="ui-input-input--display" title="Input" />',
        storyIds,
        requireDisplay: true,
      }),
    ).toEqual([
      'Line 1: The first component preview must use a story exported as Display.',
    ]);
  });

  it.each(['', 'title=""', 'title="   "', 'title={label}'])(
    'rejects a missing or unverifiable preview title: %s',
    (title) => {
      expect(
        checkStoryEmbeds({
          content: `<StoryEmbed storyId="ui-input-input--default" ${title} />`,
          storyIds,
        }),
      ).toEqual(['Line 1: StoryEmbed needs a descriptive literal title.']);
    },
  );

  it('rejects interaction stories embedded in documentation', () => {
    expect(
      checkStoryEmbeds({
        content:
          '<StoryEmbed storyId="ui-input-input--default" title="Input example" />',
        storyIds,
        storiesWithPlayFunctions: new Set(['ui-input-input--default']),
      }),
    ).toEqual([
      'Line 1: Storybook story "ui-input-input--default" has a play function. Documentation stories must be presentational.',
    ]);
  });

  it('accepts an existing story inside a nested preview', () => {
    expect(
      checkStoryEmbeds({
        content: `<Tabs>
  <Tab title="Preview">
    <StoryEmbed storyId="ui-input-input--default" title="Input example" />
  </Tab>
</Tabs>`,
        storyIds,
      }),
    ).toEqual([]);
  });

  it('reports a renamed or deleted story with its line number', () => {
    expect(
      checkStoryEmbeds({
        content: '\n<StoryEmbed storyId="ui-input-input--removed" />',
        storyIds,
      }),
    ).toEqual([
      'Line 2: Storybook story "ui-input-input--removed" does not exist.',
    ]);
  });

  it.each([
    '<StoryEmbed />',
    '<StoryEmbed storyId={selectedStory} />',
    '<StoryEmbed storyId="" />',
    '<StoryEmbed storyId="ui-input-input--default" title="Input example" {...props} />',
  ])('rejects an unverifiable story ID in %s', (content) => {
    expect(checkStoryEmbeds({ content, storyIds })).toEqual([
      'Line 1: StoryEmbed needs a literal storyId.',
    ]);
  });

  it('checks a renamed snippet import', () => {
    expect(
      checkStoryEmbeds({
        content: `import { StoryEmbed as Preview } from '/snippets/ui/StoryEmbed.mdx';

<Preview storyId="removed-story" />`,
        storyIds,
      }),
    ).toEqual(['Line 3: Storybook story "removed-story" does not exist.']);
  });

  it('rejects a default import that cannot render the named StoryEmbed export', () => {
    expect(
      checkStoryEmbeds({
        content: `import StoryEmbed from '/snippets/ui/StoryEmbed.mdx';

<StoryEmbed storyId="ui-input-input--default" title="Input example" />`,
        storyIds,
      }),
    ).toEqual(['Line 1: StoryEmbed must use a named import.']);
  });

  it('ignores examples and comments while parsing page metadata', () => {
    expect(
      checkStoryEmbeds({
        content: `---
title: Preview
description: "A {component} preview"
---

\`\`\`mdx
<StoryEmbed storyId="not-a-live-embed" />
\`\`\`

\`<StoryEmbed storyId="inline-code" />\`

{/* <StoryEmbed storyId="commented-out" /> */}`,
        storyIds,
      }),
    ).toEqual([]);
  });
});
