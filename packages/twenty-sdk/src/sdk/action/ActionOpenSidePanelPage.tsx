import {
  enqueueSnackbar,
  getFrontComponentActionErrorDedupeKey,
  openSidePanelPage,
  unmountFrontComponent,
  useFrontComponentId,
} from '@/sdk/front-component-api';
import { useEffect, useState } from 'react';

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
            message: 'Action failed',
            detailedMessage: error.message,
            variant: 'error',
            dedupeKey: getFrontComponentActionErrorDedupeKey(frontComponentId),
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
