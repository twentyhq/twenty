import { useEffect, useState } from 'react';

import {
  enqueueSnackbar,
  getFrontComponentActionErrorDedupeKey,
  openActionConfirmationModal,
  unmountFrontComponent,
  useFrontComponentId,
  type ActionConfirmationModalAccent,
} from '../front-component-api';

export type ActionModalProps = {
  title: string;
  subtitle: string;
  execute: () => void | Promise<void>;
  confirmButtonText?: string;
  confirmButtonAccent?: ActionConfirmationModalAccent;
};

export const ActionModal = ({
  title,
  subtitle,
  execute,
  confirmButtonText,
  confirmButtonAccent,
}: ActionModalProps) => {
  const [hasExecuted, setHasExecuted] = useState(false);

  const frontComponentId = useFrontComponentId();

  useEffect(() => {
    if (hasExecuted) {
      return;
    }

    setHasExecuted(true);

    const run = async () => {
      try {
        const actionConfirmationModalResult = await openActionConfirmationModal(
          {
            title,
            subtitle,
            confirmButtonText,
            confirmButtonAccent,
          },
        );

        if (actionConfirmationModalResult === 'confirm') {
          await execute();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        await enqueueSnackbar({
          message: 'Action failed',
          detailedMessage: message,
          variant: 'error',
          dedupeKey: getFrontComponentActionErrorDedupeKey(frontComponentId),
        });
      } finally {
        await unmountFrontComponent();
      }
    };

    run();
  }, [
    title,
    subtitle,
    execute,
    confirmButtonText,
    confirmButtonAccent,
    hasExecuted,
    frontComponentId,
  ]);

  return null;
};
