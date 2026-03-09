import {
  enqueueSnackbar,
  getFrontComponentCommandErrorDedupeKey,
  openSidePanelPage,
  unmountFrontComponent,
  useFrontComponentId,
} from '@/sdk/front-component-api';
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

      try {
        await openSidePanelPage({
          page,
          pageTitle,
          pageIcon,
          shouldResetSearchState,
        });
      } catch (error) {
        if (error instanceof Error) {
          await enqueueSnackbar({
            message: 'Command failed',
            detailedMessage: error.message,
            variant: 'error',
            dedupeKey: getFrontComponentCommandErrorDedupeKey(frontComponentId),
          });
        }
      } finally {
        await unmountFrontComponent();
      }
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
