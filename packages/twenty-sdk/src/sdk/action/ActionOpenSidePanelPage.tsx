import { useEffect, useRef } from 'react';

import { openSidePanelPage } from '../front-component-api';

export type ActionOpenSidePanelPageProps = {
  page: string;
  pageTitle: string;
  pageIcon?: string;
  execute?: () => void | Promise<void>;
};

export const ActionOpenSidePanelPage = ({
  page,
  pageTitle,
  pageIcon,
  execute,
}: ActionOpenSidePanelPageProps) => {
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    if (hasExecutedRef.current) {
      return;
    }

    hasExecutedRef.current = true;

    execute?.();

    openSidePanelPage({ page, pageTitle, pageIcon });
  }, [page, pageTitle, pageIcon, execute]);

  return null;
};
