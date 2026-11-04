import { t } from '@lingui/core/macro';
import { isPlainObject } from 'twenty-shared/utils';
import { type ThemeColor } from 'twenty-ui/theme';

import { type McpServerToolAnnotations } from '@/mcp-servers/types/McpServerToolAnnotations';

export type McpServerToolAnnotationBadge = {
  key: keyof McpServerToolAnnotations;
  color: ThemeColor;
  label: string;
};

export const getMcpServerToolAnnotationBadges = (
  annotations: unknown,
): McpServerToolAnnotationBadge[] => {
  if (!isPlainObject(annotations)) {
    return [];
  }

  const { readOnlyHint, destructiveHint, idempotentHint, openWorldHint } =
    annotations as McpServerToolAnnotations;

  const badges: McpServerToolAnnotationBadge[] = [];

  if (readOnlyHint === true) {
    badges.push({ key: 'readOnlyHint', color: 'green', label: t`Read-only` });
  }

  if (destructiveHint === true) {
    badges.push({
      key: 'destructiveHint',
      color: 'red',
      label: t`Destructive`,
    });
  }

  if (idempotentHint === true) {
    badges.push({
      key: 'idempotentHint',
      color: 'blue',
      label: t`Idempotent`,
    });
  }

  if (openWorldHint === true) {
    badges.push({
      key: 'openWorldHint',
      color: 'orange',
      label: t`Open world`,
    });
  }

  return badges;
};
