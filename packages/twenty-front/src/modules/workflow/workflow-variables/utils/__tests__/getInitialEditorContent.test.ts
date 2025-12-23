import { getInitialEditorContent } from '@/workflow/workflow-variables/utils/getInitialEditorContent';

describe('getInitialEditorContent', () => {
  it('should handle single line text', () => {
    expect(getInitialEditorContent('Hello world')).toMatchInlineSnapshot(`
{
  "content": [
    {
      "content": [
        {
          "text": "Hello world",
          "type": "text",
        },
      ],
      "type": "paragraph",
    },
  ],
  "type": "doc",
}
`);
  });

  it('should handle text with newlines', () => {
    expect(getInitialEditorContent('Line 1\nLine 2')).toMatchInlineSnapshot(`
{
  "content": [
    {
      "content": [
        {
          "text": "Line 1",
          "type": "text",
        },
        {
          "type": "hardBreak",
        },
        {
          "text": "Line 2",
          "type": "text",
        },
      ],
      "type": "paragraph",
    },
  ],
  "type": "doc",
}
`);
  });

  it('should handle single variable', () => {
    expect(getInitialEditorContent('{{user.name}}')).toMatchInlineSnapshot(`
{
  "content": [
    {
      "content": [
        {
          "attrs": {
            "variable": "{{user.name}}",
          },
          "type": "variableTag",
        },
      ],
      "type": "paragraph",
    },
  ],
  "type": "doc",
}
`);
  });

  it('should handle text with variables', () => {
    expect(getInitialEditorContent('Hello {{user.name}}, welcome!'))
      .toMatchInlineSnapshot(`
{
  "content": [
    {
      "content": [
        {
          "text": "Hello ",
          "type": "text",
        },
        {
          "attrs": {
            "variable": "{{user.name}}",
          },
          "type": "variableTag",
        },
        {
          "text": ", welcome!",
          "type": "text",
        },
      ],
      "type": "paragraph",
    },
  ],
  "type": "doc",
}
`);
  });

  it('should handle text with multiple variables', () => {
    expect(
      getInitialEditorContent('Hello {{user.firstName}} {{user.lastName}}!'),
    ).toMatchInlineSnapshot(`
{
  "content": [
    {
      "content": [
        {
          "text": "Hello ",
          "type": "text",
        },
        {
          "attrs": {
            "variable": "{{user.firstName}}",
          },
          "type": "variableTag",
        },
        {
          "text": " ",
          "type": "text",
        },
        {
          "attrs": {
            "variable": "{{user.lastName}}",
          },
          "type": "variableTag",
        },
        {
          "text": "!",
          "type": "text",
        },
      ],
      "type": "paragraph",
    },
  ],
  "type": "doc",
}
`);
  });

  it('should handle newlines with variables', () => {
    expect(
      getInitialEditorContent('Hello {{user.name}}\nWelcome to {{app.name}}'),
    ).toMatchInlineSnapshot(`
{
  "content": [
    {
      "content": [
        {
          "text": "Hello ",
          "type": "text",
        },
        {
          "attrs": {
            "variable": "{{user.name}}",
          },
          "type": "variableTag",
        },
        {
          "type": "hardBreak",
        },
        {
          "text": "Welcome to ",
          "type": "text",
        },
        {
          "attrs": {
            "variable": "{{app.name}}",
          },
          "type": "variableTag",
        },
      ],
      "type": "paragraph",
    },
  ],
  "type": "doc",
}
`);
  });

  it('should handle empty strings', () => {
    expect(getInitialEditorContent('')).toMatchInlineSnapshot(`
{
  "content": [
    {
      "content": [],
      "type": "paragraph",
    },
  ],
  "type": "doc",
}
`);
  });

  it('should handle multiple empty parts', () => {
    expect(getInitialEditorContent('Hello    {{user.name}}    !'))
      .toMatchInlineSnapshot(`
{
  "content": [
    {
      "content": [
        {
          "text": "Hello    ",
          "type": "text",
        },
        {
          "attrs": {
            "variable": "{{user.name}}",
          },
          "type": "variableTag",
        },
        {
          "text": "    !",
          "type": "text",
        },
      ],
      "type": "paragraph",
    },
  ],
  "type": "doc",
}
`);
  });

  it('should handle multiple newlines', () => {
    expect(getInitialEditorContent('Line1\n\nLine3')).toMatchInlineSnapshot(`
{
  "content": [
    {
      "content": [
        {
          "text": "Line1",
          "type": "text",
        },
        {
          "type": "hardBreak",
        },
        {
          "type": "hardBreak",
        },
        {
          "text": "Line3",
          "type": "text",
        },
      ],
      "type": "paragraph",
    },
  ],
  "type": "doc",
}
`);
  });

  it('should ignore malformed variable tags', () => {
    expect(
      getInitialEditorContent('Hello {{user.name}} and {{invalid}more}} text'),
    ).toMatchInlineSnapshot(`
{
  "content": [
    {
      "content": [
        {
          "text": "Hello ",
          "type": "text",
        },
        {
          "attrs": {
            "variable": "{{user.name}}",
          },
          "type": "variableTag",
        },
        {
          "text": " and {{invalid}more}} text",
          "type": "text",
        },
      ],
      "type": "paragraph",
    },
  ],
  "type": "doc",
}
`);
  });

  it('should handle trailing newlines', () => {
    expect(getInitialEditorContent('Hello\n')).toMatchInlineSnapshot(`
{
  "content": [
    {
      "content": [
        {
          "text": "Hello",
          "type": "text",
        },
        {
          "type": "hardBreak",
        },
      ],
      "type": "paragraph",
    },
  ],
  "type": "doc",
}
`);
  });
});
