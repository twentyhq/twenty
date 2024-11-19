import { createState } from 'twenty-ui';

type ClientConfigApiStatus = {
  isLoaded: boolean;
  isErrored: boolean;
};

export const clientConfigApiStatusState = createState<ClientConfigApiStatus>({
  key: 'clientConfigApiStatus',
  defaultValue: { isLoaded: false, isErrored: false },
});
