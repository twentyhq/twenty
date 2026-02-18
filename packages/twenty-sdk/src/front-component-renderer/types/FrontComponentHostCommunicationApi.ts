import { type AppPath, type NavigateOptions } from 'twenty-shared/types';

import { type OpenConfirmationModalParams } from '../../sdk/front-component-api/functions/openConfirmationModal';
import { type OpenSidePanelPageParams } from '../../sdk/front-component-api/functions/openSidePanelPage';

export type FrontComponentHostCommunicationApi = {
  navigate: (
    to: AppPath,
    params?: Record<string, string | null>,
    queryParams?: Record<string, unknown>,
    options?: NavigateOptions,
  ) => Promise<void>;
  openConfirmationModal: (
    params: OpenConfirmationModalParams,
  ) => Promise<boolean>;
  openSidePanelPage: (params: OpenSidePanelPageParams) => Promise<void>;
};
