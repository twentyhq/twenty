import { createState } from 'twenty-ui/utilities';

export const isEmailingDomainsEnabledState = createState<boolean>({
  key: 'isEmailingDomainsEnabled',
  defaultValue: false,
});
