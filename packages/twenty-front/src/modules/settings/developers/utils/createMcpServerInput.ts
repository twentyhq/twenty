import { isNonEmptyString } from '@sniptt/guards';

import { type McpServerFormValues } from '@/settings/developers/validation-schemas/mcpServerFormSchema';

export const createMcpServerCreateInput = (
  formValues: McpServerFormValues,
) => ({
  name: formValues.name.trim(),
  label: formValues.label.trim(),
  url: formValues.url.trim(),
  isEnabled: formValues.isEnabled,
  ...(isNonEmptyString(formValues.authorizationHeaderValue) && {
    authorizationHeaderValue: formValues.authorizationHeaderValue,
  }),
});

// The stored header is never read back: it only changes when typed anew or cleared
export const createMcpServerUpdateInput = (
  formValues: McpServerFormValues,
) => ({
  name: formValues.name.trim(),
  label: formValues.label.trim(),
  url: formValues.url.trim(),
  isEnabled: formValues.isEnabled,
  ...(isNonEmptyString(formValues.authorizationHeaderValue)
    ? { authorizationHeaderValue: formValues.authorizationHeaderValue }
    : formValues.shouldClearAuthorizationHeader
      ? { authorizationHeaderValue: null }
      : {}),
});
