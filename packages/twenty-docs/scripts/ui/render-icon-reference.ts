import { type IconDocumentationGroup } from '../../../twenty-ui/docs/IconDocumentationGroup';

export const renderIconReference = (groups: IconDocumentationGroup[]): string =>
  groups
    .map((group) => {
      const propList = group.props.map((prop) => `\`${prop}\``).join(', ');

      return [
        `### ${group.supportsSvgAttributes ? 'SVG icons' : propList}`,
        '',
        `Supported props: ${propList}.${group.supportsSvgAttributes ? ' Native SVG attributes and refs are also accepted.' : ' Other native attributes are not forwarded.'}`,
        '',
        group.names.map((name) => `- \`${name}\``).join('\n'),
      ].join('\n');
    })
    .join('\n\n') + '\n';
