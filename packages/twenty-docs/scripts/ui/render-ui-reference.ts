import { type TokenDocumentation } from '../../../twenty-ui/docs/types';

const escapeTableCell = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
    .replace(/\|/g, '&#124;')
    .replace(/\r?\n/g, ' ');

export const renderTokenReference = (tokens: TokenDocumentation[]): string => {
  const groups = new Map<string, TokenDocumentation[]>();

  for (const token of tokens) {
    const group = token.path.split('.')[0];
    const entries = groups.get(group);

    if (entries) {
      entries.push(token);
    } else {
      groups.set(group, [token]);
    }
  }

  return (
    [...groups.entries()]
      .map(([group, entries]) =>
        [
          `## ${group}`,
          '',
          '| Token path | CSS variable | Light | Dark | Numeric |',
          '| --- | --- | --- | --- | --- |',
          ...entries.map(
            (token) =>
              `| ${[token.path, token.cssVariable, token.light, token.dark, token.isNumber ? 'Yes' : ''].map(escapeTableCell).join(' | ')} |`,
          ),
        ].join('\n'),
      )
      .join('\n\n') + '\n'
  );
};
