import { type AppPath, type NavigateOptions } from 'twenty-shared/types';

import { type OpenSidePanelPageParams } from '../../sdk/front-component-api/functions/openSidePanelPage';

export type FrontComponentHostCommunicationApi = {
  navigate: (
    to: AppPath,
    params?: Record<string, string | null>,
    queryParams?: Record<string, unknown>,
    options?: NavigateOptions,
  ) => Promise<void>;
  openSidePanelPage: (params: OpenSidePanelPageParams) => Promise<void>;
  unmountFrontComponent: () => Promise<void>;
};
