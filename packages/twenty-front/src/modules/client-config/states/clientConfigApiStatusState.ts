import { createState } from 'twenty-ui/utilities';
import { ClientConfig } from '~/generated/graphql';

type ClientConfigApiStatus = {
  isLoadedOnce: boolean;
  isLoading: boolean;
  isErrored: boolean;
  isSaved: boolean;
  error?: Error;
  data?: { clientConfig: ClientConfig };
};

export const clientConfigApiStatusState = createState<ClientConfigApiStatus>({
  key: 'clientConfigApiStatus',
  defaultValue: {
    isLoadedOnce: false,
    isLoading: false,
    isErrored: false,
    isSaved: false,
    error: undefined,
    data: undefined,
  },
});
