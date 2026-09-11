import {
  type ComponentDocumentation,
  type TokenDocumentation,
} from '../../../twenty-ui/docs/types';

const toMdxString = (value: string): string =>
  JSON.stringify(value).replace(/</g, '\\u003c');

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
        `body=${toMdxString(partName ? `${partName}.${prop.name}` : prop.name)}`,
        `type={${toMdxString(prop.type)}}`,
        ...(prop.required ? ['required'] : []),
        ...(prop.defaultValue === null
          ? []
          : [`default={${toMdxString(prop.defaultValue)}}`]),
      ];
      const description = prop.description.replace(/`/g, '');

      return `<ParamField ${attributes.join(' ')}>\n  {${toMdxString(description)}}\n</ParamField>`;
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
