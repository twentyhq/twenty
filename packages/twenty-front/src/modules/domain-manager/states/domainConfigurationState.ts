import { ClientConfig } from '~/generated/graphql';
import { createState } from 'twenty-ui/utilities';

export const domainConfigurationState = createState<
  Pick<ClientConfig, 'frontDomain' | 'defaultSubdomain'>
>({
  key: 'domainConfiguration',
  defaultValue: {
    frontDomain: '',
    defaultSubdomain: undefined,
  },
});
