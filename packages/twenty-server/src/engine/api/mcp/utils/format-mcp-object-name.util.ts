import { type McpObjectNameForms } from 'src/engine/api/mcp/types/mcp-object-name-forms.type';

export const formatMcpObjectName = ({
  objectNameForms: { nameSingular, namePlural },
  omitRegularPlural,
}: {
  objectNameForms: McpObjectNameForms;
  omitRegularPlural: boolean;
}): string =>
  omitRegularPlural && namePlural === `${nameSingular}s`
    ? nameSingular
    : `${nameSingular}/${namePlural}`;
