import {
  openSidePanelPage,
  unmountFrontComponent,
  useFrontComponentId,
} from '@/sdk/front-component';
import { useEffect, useState } from 'react';

import { type SidePanelPages } from 'twenty-shared/types';

export type CommandOpenSidePanelPageProps = {
  page: SidePanelPages;
  pageTitle: string;
  pageIcon: string;
  onClick?: () => void;
  shouldResetSearchState?: boolean;
};

export const CommandOpenSidePanelPage = ({
  page,
  pageTitle,
  pageIcon,
  onClick,
  shouldResetSearchState = false,
}: CommandOpenSidePanelPageProps) => {
  const [hasExecuted, setHasExecuted] = useState(false);

  const frontComponentId = useFrontComponentId();

  useEffect(() => {
    if (hasExecuted) {
      return;
    }

    setHasExecuted(true);

    const run = async () => {
      onClick?.();

      await openSidePanelPage({
        page,
        pageTitle,
        pageIcon,
        shouldResetSearchState,
      });

      await unmountFrontComponent();
    };

    run();
  }, [
    page,
    pageTitle,
    pageIcon,
    shouldResetSearchState,
    onClick,
    hasExecuted,
    frontComponentId,
  ]);

  return null;
};
