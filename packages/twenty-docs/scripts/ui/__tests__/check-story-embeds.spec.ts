import { describe, expect, it } from 'vitest';

import { checkStoryEmbeds } from '../check-story-embeds.mjs';

const storyIds = new Set(['ui-input-input--default']);

describe('checkStoryEmbeds', () => {
  it('accepts an existing story inside a nested preview', () => {
    expect(
      checkStoryEmbeds({
        content: `<Tabs>
  <Tab title="Preview">
    <StoryEmbed storyId="ui-input-input--default" />
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
    '<StoryEmbed storyId="ui-input-input--default" {...props} />',
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
