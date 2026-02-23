import { type ClientConfig } from '@/client-config/types/ClientConfig';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const domainConfigurationState = createStateV2<
  Pick<ClientConfig, 'frontDomain' | 'defaultSubdomain'>
>({
  key: 'domainConfiguration',
  defaultValue: {
    frontDomain: '',
    defaultSubdomain: undefined,
  },
});
