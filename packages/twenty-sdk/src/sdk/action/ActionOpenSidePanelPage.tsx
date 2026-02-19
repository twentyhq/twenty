import { openSidePanelPage } from '@/sdk/front-component-api';
import { useEffect, useRef } from 'react';

import { type CommandMenuPages } from 'twenty-shared/types';

export type ActionOpenSidePanelPageProps = {
  page: CommandMenuPages;
  pageTitle: string;
  pageIcon: string;
  onClick?: () => void;
  shouldResetSearchState?: boolean;
};

export const ActionOpenSidePanelPage = ({
  page,
  pageTitle,
  pageIcon,
  onClick,
  shouldResetSearchState = false,
}: ActionOpenSidePanelPageProps) => {
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    if (hasExecutedRef.current) {
      return;
    }

    hasExecutedRef.current = true;

    onClick?.();

    openSidePanelPage({
      page,
      pageTitle,
      pageIcon,
      shouldResetSearchState,
    });
  }, [page, pageTitle, pageIcon, shouldResetSearchState, onClick]);

  return null;
};
