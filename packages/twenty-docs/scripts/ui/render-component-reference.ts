import { type ComponentDocumentation } from '../../../twenty-ui/docs/types';

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
  [
    ...(component.props.length > 0
      ? [renderProps({ props: component.props })]
      : []),
    ...(component.parts ?? []).map(
      (part) =>
        `### ${component.name}.${part.name}\n\n${renderProps({ props: part.props, partName: part.name })}`,
    ),
  ].join('\n');
