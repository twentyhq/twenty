import { createState } from 'twenty-ui/utilities';
import { ClientConfig } from '~/generated/graphql';

type ClientConfigApiStatus = {
  isLoaded: boolean;
  isLoading: boolean;
  isErrored: boolean;
  error?: Error;
  data?: { clientConfig: ClientConfig };
};

export const clientConfigApiStatusState = createState<ClientConfigApiStatus>({
  key: 'clientConfigApiStatus',
  defaultValue: {
    isLoaded: false,
    isLoading: false,
    isErrored: false,
    error: undefined,
    data: undefined,
  },
});
