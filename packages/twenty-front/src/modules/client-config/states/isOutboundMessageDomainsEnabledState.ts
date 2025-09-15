import { createState } from 'twenty-ui/utilities';

export const isOutboundMessageDomainsEnabledState = createState<boolean>({
  key: 'isOutboundMessageDomainsEnabled',
  defaultValue: false,
});
