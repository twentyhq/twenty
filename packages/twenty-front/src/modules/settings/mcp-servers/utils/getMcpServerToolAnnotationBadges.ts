import { t } from '@lingui/core/macro';
import { type ThemeColor } from 'twenty-ui/theme';
import { type z } from 'zod';

import { mcpServerToolAnnotationsSchema } from '@/settings/mcp-servers/validation-schemas/mcpServerToolAnnotationsSchema';
import { type McpServerTool } from '~/generated-metadata/graphql';

type McpServerToolAnnotationBadge = {
  key: keyof z.infer<typeof mcpServerToolAnnotationsSchema>;
  color: ThemeColor;
  label: string;
};

export const getMcpServerToolAnnotationBadges = (
  annotations: McpServerTool['annotations'],
): McpServerToolAnnotationBadge[] => {
  const parsedAnnotations =
    mcpServerToolAnnotationsSchema.safeParse(annotations);

  if (!parsedAnnotations.success) {
    return [];
  }

  const badges: McpServerToolAnnotationBadge[] = [
    { key: 'readOnlyHint', color: 'green', label: t`Read-only` },
    { key: 'destructiveHint', color: 'red', label: t`Destructive` },
    { key: 'idempotentHint', color: 'blue', label: t`Idempotent` },
    { key: 'openWorldHint', color: 'orange', label: t`Open world` },
  ];

  return badges.filter(({ key }) => parsedAnnotations.data[key] ?? false);
};
