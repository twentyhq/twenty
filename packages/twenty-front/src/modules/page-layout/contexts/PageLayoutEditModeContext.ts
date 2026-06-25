import { createRequiredContext } from '~/utils/createRequiredContext';

export type PageLayoutEditModeContextType = {
  isInEditMode: boolean;
};

export const [PageLayoutEditModeProviderContext, usePageLayoutEditModeContext] =
  createRequiredContext<PageLayoutEditModeContextType>(
    'PageLayoutEditModeContext',
  );
