import { type ClientConfig } from '@/client-config/types/ClientConfig';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { DEFAULT_SUBDOMAIN_MIN_LENGTH } from 'twenty-shared/constants';

export const domainConfigurationState = createAtomState<
  Pick<
    ClientConfig,
    | 'frontDomain'
    | 'defaultSubdomain'
    | 'publicFunctionDomain'
    | 'subdomainMinLength'
  >
>({
  key: 'domainConfiguration',
  defaultValue: {
    frontDomain: '',
    defaultSubdomain: undefined,
    publicFunctionDomain: undefined,
    subdomainMinLength: DEFAULT_SUBDOMAIN_MIN_LENGTH,
  },
});
