import { createState } from 'twenty-ui';
import { ClientConfig } from '~/generated/graphql';

export const urlManagerState = createState<
  Pick<ClientConfig, 'frontDomain' | 'defaultSubdomain'>
>({
  key: 'urlManager',
  defaultValue: {
    frontDomain: '',
    defaultSubdomain: undefined,
  },
});
