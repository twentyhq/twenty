import { t } from '@lingui/core/macro';
import { isSnakeCaseToolName } from 'twenty-shared/ai';
import { MCP_SERVER_NAME_MAX_LENGTH } from 'twenty-shared/constants';
import { isHttpUrl } from 'twenty-shared/utils';
import { z } from 'zod';

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
      .refine(isSnakeCaseToolName, {
        error: () =>
          t`Use lowercase letters, digits and underscores, starting with a letter`,
      }),
    url: z
      .string()
      .trim()
      .min(1, { error: () => t`URL is required` })
      .refine(isHttpUrl, {
        error: () => t`Please enter a valid http(s) URL`,
      }),
  });

export type McpServerFormValues = z.infer<
  ReturnType<typeof getMcpServerFormSchema>
>;
