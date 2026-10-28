import { getDisplayableStreamingMarkdown } from '@/ai/utils/getDisplayableStreamingMarkdown';

describe('getDisplayableStreamingMarkdown', () => {
  it.each([
    {
      description: 'keeps finished markdown as is',
      text: 'A **bold** word and `code`.',
      expected: 'A **bold** word and `code`.',
    },
    {
      description: 'closes unfinished bold text',
      text: 'Key terms: **Visible pipe',
      expected: 'Key terms: **Visible pipe**',
    },
    {
      description: 'hides a bold marker with nothing after it yet',
      text: 'Key terms: **',
      expected: 'Key terms:',
    },
    {
      description: 'closes unfinished inline code',
      text: 'Run `yarn ins',
      expected: 'Run `yarn ins`',
    },
    {
      description: 'ignores bold markers inside inline code',
      text: 'Use `a ** b` to',
      expected: 'Use `a ** b` to',
    },
    {
      description: 'hides an unfinished chat reference',
      text: 'Updated [[company:abc|Ac',
      expected: 'Updated',
    },
    {
      description: 'hides an unfinished link',
      text: 'See [the docs](https://docs.twen',
      expected: 'See',
    },
    {
      description: 'hides an unfinished image',
      text: 'Chart: ![chart](https://img',
      expected: 'Chart:',
    },
    {
      description: 'keeps a finished link',
      text: 'See [the docs](https://docs.twenty.com) now',
      expected: 'See [the docs](https://docs.twenty.com) now',
    },
    {
      description: 'hides a table until its delimiter row arrives',
      text: 'Intro\n\n| Name | Employees |',
      expected: 'Intro',
    },
    {
      description: 'shows a table once its delimiter row arrived',
      text: 'Intro\n\n| Name | Employees |\n| --- | --- |\n| Acme | 4',
      expected: 'Intro\n\n| Name | Employees |\n| --- | --- |\n| Acme | 4',
    },
    {
      description: 'keeps a code block that just closed',
      text: '```ts\nconst value = 1;\n```',
      expected: '```ts\nconst value = 1;\n```',
    },
    {
      description: 'ignores chat reference syntax inside inline code',
      text: 'Use `[[` to mention a record',
      expected: 'Use `[[` to mention a record',
    },
    {
      description: 'ignores a bracket inside unfinished inline code',
      text: 'Call `items[0',
      expected: 'Call `items[0`',
    },
    {
      description: 'leaves an open code block untouched',
      text: '```ts\nconst value = **',
      expected: '```ts\nconst value = **',
    },
  ])('$description', ({ text, expected }) => {
    expect(getDisplayableStreamingMarkdown(text)).toBe(expected);
  });
});
