import { describe, expect, it } from 'vitest';

import { findAngleBracketPlaceholders } from '../lint-mdx';

describe('findAngleBracketPlaceholders', () => {
  it('flags a placeholder in prose', () => {
    const violations = findAngleBracketPlaceholders(
      'Set the header to <your-api-key> before calling.',
    );

    expect(violations).toEqual([
      { line: 1, column: 19, text: '<your-api-key>', name: 'your-api-key' },
    ]);
  });

  it('reports the line and column of a placeholder further down the page', () => {
    const violations = findAngleBracketPlaceholders(
      'intro\n\nuse <workspace-id> here',
    );

    expect(violations).toEqual([
      { line: 3, column: 5, text: '<workspace-id>', name: 'workspace-id' },
    ]);
  });

  it('allows HTML elements', () => {
    expect(
      findAngleBracketPlaceholders('press <kbd>K</kbd> to search'),
    ).toEqual([]);
  });

  it('allows closing tags', () => {
    expect(findAngleBracketPlaceholders('<details>x</details>')).toEqual([]);
  });

  it('ignores placeholders inside a fenced code block', () => {
    expect(
      findAngleBracketPlaceholders(
        'before\n\n```bash\ncurl -H "key: <token>"\n```\n\nafter',
      ),
    ).toEqual([]);
  });

  it('ignores placeholders inside inline code', () => {
    expect(findAngleBracketPlaceholders('run `deploy <env>` first')).toEqual(
      [],
    );
  });

  it('still flags a placeholder after a closed inline code span', () => {
    const violations = findAngleBracketPlaceholders(
      'run `deploy` against <env> now',
    );

    expect(violations).toHaveLength(1);
    expect(violations[0].name).toBe('env');
  });

  it('flags an HTML element name used as a host placeholder', () => {
    const violations = findAngleBracketPlaceholders(
      'open https://<code>.twenty.com',
    );

    expect(violations).toHaveLength(1);
    expect(violations[0].name).toBe('code');
  });

  it('flags a placeholder inside a path segment', () => {
    const violations = findAngleBracketPlaceholders(
      'edit packages/<package-name>/README.md',
    );

    expect(violations).toHaveLength(1);
    expect(violations[0].name).toBe('package-name');
  });

  it('does not flag single letter or capitalised tags', () => {
    expect(
      findAngleBracketPlaceholders('<a>link</a> and <Card>body</Card>'),
    ).toEqual([]);
  });

  it('reports every placeholder on a line', () => {
    const violations = findAngleBracketPlaceholders(
      '<first-id> and <second-id>',
    );

    expect(violations.map((violation) => violation.name)).toEqual([
      'first-id',
      'second-id',
    ]);
  });
  it('is not blinded by an unpaired backtick earlier in the file', () => {
    const violations = findAngleBracketPlaceholders(
      'a stray ` backtick\n\nthen use <workspace-id> here',
    );

    expect(violations).toHaveLength(1);
    expect(violations[0].name).toBe('workspace-id');
  });

  it('pairs backtick runs by length', () => {
    expect(
      findAngleBracketPlaceholders('``code with ` tick and <env>``'),
    ).toEqual([]);
  });

  it('does not treat a backtick on a previous line as opening a span', () => {
    const violations = findAngleBracketPlaceholders(
      'ends with a tick `\nnext line has <api-key>',
    );

    expect(violations).toHaveLength(1);
    expect(violations[0].name).toBe('api-key');
  });

  it('keeps a four-backtick block that shows a triple-backtick example as code', () => {
    expect(
      findAngleBracketPlaceholders('````md\n```\n<token>\n```\n````'),
    ).toEqual([]);
  });

  it('closes a block on a longer fence than the one that opened it', () => {
    expect(findAngleBracketPlaceholders('```ini\nKEY=<value>\n````')).toEqual(
      [],
    );
  });
});
