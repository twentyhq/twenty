import { type ClientConfig } from '@/client-config/types/ClientConfig';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const domainConfigurationState = createState<
  Pick<ClientConfig, 'frontDomain' | 'defaultSubdomain'>
>({
  key: 'domainConfiguration',
  defaultValue: {
    frontDomain: '',
    defaultSubdomain: undefined,
  },
});
