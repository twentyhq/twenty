import { describe, expect, it } from 'vitest';

import {
  renderComponentReference,
  renderTokenReference,
} from '../render-ui-reference';

describe('renderComponentReference', () => {
  it('escapes attributes and prose while keeping markdown and code intact', () => {
    const reference = renderComponentReference({
      name: 'Example',
      entryPoint: 'twenty-ui/input',
      slug: 'input/example',
      props: [
        {
          name: 'render',
          type: 'Ref<custom> | "quoted"',
          required: true,
          defaultValue: null,
          description:
            'Render `<custom>` with {value} & more.\n\n- `unmount`: Manually unmounts.\n\n```tsx\n<Example render={<span />} />\n```',
        },
      ],
    });

    expect(reference).toBe(
      [
        '<ParamField body="render" type="Ref&lt;custom&gt; | &quot;quoted&quot;" required>',
        '  Render `<custom>` with &#123;value&#125; &amp; more.',
        '',
        '  - `unmount`: Manually unmounts.',
        '',
        '  ```tsx',
        '  <Example render={<span />} />',
        '  ```',
        '</ParamField>',
        '',
      ].join('\n'),
    );
  });
});

describe('compound component references', () => {
  it('distinguishes identically named props on different parts and retains defaults', () => {
    const reference = renderComponentReference({
      name: 'Menu',
      entryPoint: 'twenty-ui/surfaces',
      slug: 'surfaces/menu',
      props: [],
      parts: [
        {
          name: 'Item',
          props: [
            {
              name: 'closeOnClick',
              type: 'boolean',
              required: false,
              defaultValue: 'true',
              description: 'Close after selection.',
            },
          ],
        },
        {
          name: 'CheckboxItem',
          props: [
            {
              name: 'closeOnClick',
              type: 'boolean',
              required: false,
              defaultValue: 'false',
              description: 'Keep open for multiple choices.',
            },
          ],
        },
      ],
    });

    expect(reference).toContain('### Menu.Item');
    expect(reference).toContain('### Menu.CheckboxItem');
    expect(reference).toContain(
      '<ParamField body="Item.closeOnClick" type="boolean" default="true">',
    );
    expect(reference).toContain(
      '<ParamField body="CheckboxItem.closeOnClick" type="boolean" default="false">',
    );
  });
});

describe('renderTokenReference', () => {
  it('keeps token expressions inside one table cell and distinguishes numeric values', () => {
    const reference = renderTokenReference([
      {
        path: 'spacing.1',
        cssVariable: '--t-spacing-1',
        light: 'calc(1px | <custom> & {value})\nnext',
        dark: '4px',
        isNumber: false,
      },
      {
        path: 'icon.size.md',
        cssVariable: '--t-icon-size-md',
        light: '16',
        dark: '16',
        isNumber: true,
      },
    ]);
    const rows = reference
      .split('\n')
      .filter(
        (line) => line.startsWith('| spacing.') || line.startsWith('| icon.'),
      );

    expect(rows).toHaveLength(2);
    expect(rows.every((row) => row.split('|').length === 7)).toBe(true);
    expect(reference).not.toContain('<custom>');
    expect(rows[1]).toContain('| Yes |');
    expect(reference).toContain('## spacing');
    expect(reference).toContain('## icon');
  });
});
