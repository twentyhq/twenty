import { t } from '@lingui/core/macro';
import { isValidUrl } from 'twenty-shared/utils';
import { z } from 'zod';

const MCP_SERVER_NAME_PATTERN = /^[a-z][a-z0-9_]{0,31}$/;

export const getMcpServerFormSchema = () =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, { error: () => t`Name is required` })
      .regex(MCP_SERVER_NAME_PATTERN, {
        error: () =>
          t`Use lowercase letters, digits and underscores, starting with a letter (32 characters max)`,
      }),
    label: z
      .string()
      .trim()
      .min(1, { error: () => t`Label is required` }),
    url: z
      .string()
      .trim()
      .min(1, { error: () => t`URL is required` })
      .refine((url) => isValidUrl(url), {
        error: () => t`Please enter a valid URL`,
      }),
    authorizationHeaderValue: z.string(),
    shouldClearAuthorizationHeader: z.boolean(),
    isEnabled: z.boolean(),
  });

export type McpServerFormValues = z.infer<
  ReturnType<typeof getMcpServerFormSchema>
>;
