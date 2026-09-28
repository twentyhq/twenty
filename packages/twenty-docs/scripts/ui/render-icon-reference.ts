import { type IconDocumentationGroup } from '../../../twenty-ui/docs/IconDocumentationGroup';

export const renderIconReference = (groups: IconDocumentationGroup[]): string =>
  groups
    .map((group) =>
      [
        `### ${group.supportsSvgAttributes ? 'SVG icons' : group.props.map((prop) => `\`${prop}\``).join(', ')}`,
        '',
        `Supported props: ${group.props.map((prop) => `\`${prop}\``).join(', ')}.${group.supportsSvgAttributes ? ' Native SVG attributes and refs are also accepted.' : ' Other native attributes are not forwarded.'}`,
        '',
        group.names.map((name) => `- \`${name}\``).join('\n'),
      ].join('\n'),
    )
    .join('\n\n') + '\n';
