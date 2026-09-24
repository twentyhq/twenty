import { type McpObjectNameForms } from 'src/engine/api/mcp/types/mcp-object-name-forms.type';

// Both forms let agents build *_one_* and *_many_* names for irregular
// plurals (person/people) without a discovery call. The compact form drops
// the plural only when it is the singular plus "s", so a reader told that
// rule can always rebuild it; identical forms stay paired for that reason.
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
