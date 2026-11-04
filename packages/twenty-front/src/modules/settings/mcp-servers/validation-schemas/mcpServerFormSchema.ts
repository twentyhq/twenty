import { t } from '@lingui/core/macro';
import { isValidUrl } from 'twenty-shared/utils';
import { z } from 'zod';

import { MCP_SERVER_NAME_MAX_LENGTH } from '@/settings/mcp-servers/constants/McpServerNameMaxLength';

const MCP_SERVER_NAME_PATTERN = /^[a-z][a-z0-9_]*$/;
const HTTP_URL_PATTERN = /^https?:\/\//i;

export const getMcpServerFormSchema = () =>
  z.object({
    label: z
      .string()
      .trim()
      .min(1, { error: () => t`Label is required` }),
    name: z
      .string()
      .trim()
      .min(1, { error: () => t`Name is required` })
      .max(MCP_SERVER_NAME_MAX_LENGTH, {
        error: () =>
          t`Name must be at most ${MCP_SERVER_NAME_MAX_LENGTH} characters`,
      })
      .regex(MCP_SERVER_NAME_PATTERN, {
        error: () =>
          t`Use lowercase letters, digits and underscores, starting with a letter`,
      }),
    url: z
      .string()
      .trim()
      .min(1, { error: () => t`URL is required` })
      .refine((url) => HTTP_URL_PATTERN.test(url) && isValidUrl(url), {
        error: () => t`Please enter a valid http(s) URL`,
      }),
    connectionProviderId: z.string().nullable(),
    isActive: z.boolean(),
  });

export type McpServerFormValues = z.infer<
  ReturnType<typeof getMcpServerFormSchema>
>;
