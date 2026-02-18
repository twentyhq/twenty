import { isDefined } from 'twenty-shared/utils';

export type OpenSidePanelPageParams = {
  page: string;
  pageTitle: string;
  pageIcon?: string;
};

type OpenSidePanelPageFunction = (
  params: OpenSidePanelPageParams,
) => Promise<void>;

const OPEN_SIDE_PANEL_PAGE_KEY = '__twentySdkOpenSidePanelPageFunction__';

export const setOpenSidePanelPage = (fn: OpenSidePanelPageFunction): void => {
  (globalThis as Record<string, unknown>)[OPEN_SIDE_PANEL_PAGE_KEY] = fn;
};

export const openSidePanelPage: OpenSidePanelPageFunction = (
  params: OpenSidePanelPageParams,
): Promise<void> => {
  const openSidePanelPageFunction = (globalThis as Record<string, unknown>)[
    OPEN_SIDE_PANEL_PAGE_KEY
  ] as OpenSidePanelPageFunction | undefined;

  if (!isDefined(openSidePanelPageFunction)) {
    throw new Error('openSidePanelPageFunction is not set');
  }

  return openSidePanelPageFunction(params);
};
