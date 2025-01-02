import { createState } from '@ui/utilities/state/utils/createState';
import { ClientConfig } from '~/generated/graphql';

export const domainConfigurationState = createState<
  Pick<ClientConfig, 'frontDomain' | 'defaultSubdomain'>
>({
  key: 'domainConfiguration',
  defaultValue: {
    frontDomain: '',
    defaultSubdomain: undefined,
  },
});
