import {
  type ComponentDocumentation,
  type TokenDocumentation,
} from '../../../twenty-ui/docs/types';

const CODE_SEGMENT_PATTERN = /(`{3,})[\s\S]*?\1|`[^`\n]+`/g;

const escapeAttributeValue = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const escapeProseText = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;');

const escapeMarkdown = (markdown: string): string => {
  let escaped = '';
  let proseStart = 0;

  for (const codeSegment of markdown.matchAll(CODE_SEGMENT_PATTERN)) {
    escaped +=
      escapeProseText(markdown.slice(proseStart, codeSegment.index)) +
      codeSegment[0];
    proseStart = codeSegment.index + codeSegment[0].length;
  }

  return escaped + escapeProseText(markdown.slice(proseStart));
};

const indent = (text: string): string =>
  text
    .split('\n')
    .map((line) => (line.length > 0 ? `  ${line}` : line))
    .join('\n');

const renderProps = ({
  props,
  partName,
}: {
  props: ComponentDocumentation['props'];
  partName?: string;
}): string =>
  props
    .map((prop) => {
      const attributes = [
        `body="${escapeAttributeValue(partName ? `${partName}.${prop.name}` : prop.name)}"`,
        `type="${escapeAttributeValue(prop.type)}"`,
        ...(prop.required ? ['required'] : []),
        ...(prop.defaultValue === null
          ? []
          : [`default="${escapeAttributeValue(prop.defaultValue)}"`]),
      ];

      return `<ParamField ${attributes.join(' ')}>\n${indent(escapeMarkdown(prop.description))}\n</ParamField>`;
    })
    .join('\n\n') + '\n';

export const renderComponentReference = (
  component: ComponentDocumentation,
): string =>
  component.parts
    ? component.parts
        .map(
          (part) =>
            `### ${component.name}.${part.name}\n\n${renderProps({ props: part.props, partName: part.name })}`,
        )
        .join('\n')
    : renderProps({ props: component.props });

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
