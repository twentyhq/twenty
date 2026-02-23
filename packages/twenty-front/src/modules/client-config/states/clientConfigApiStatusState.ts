import { type ClientConfig } from '@/client-config/types/ClientConfig';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

type ClientConfigApiStatus = {
  isLoadedOnce: boolean;
  isLoading: boolean;
  isErrored: boolean;
  isSaved: boolean;
  error?: Error;
  data?: { clientConfig: ClientConfig };
};

export const clientConfigApiStatusState = createStateV2<ClientConfigApiStatus>({
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
