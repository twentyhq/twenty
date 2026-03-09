import { useEffect, useState } from 'react';

import {
  enqueueSnackbar,
  getFrontComponentCommandErrorDedupeKey,
  openCommandConfirmationModal,
  unmountFrontComponent,
  useFrontComponentId,
  type CommandConfirmationModalAccent,
} from '../front-component-api';

export type CommandModalProps = {
  title: string;
  subtitle: string;
  execute: () => void | Promise<void>;
  confirmButtonText?: string;
  confirmButtonAccent?: CommandConfirmationModalAccent;
};

export const CommandModal = ({
  title,
  subtitle,
  execute,
  confirmButtonText,
  confirmButtonAccent,
}: CommandModalProps) => {
  const [hasExecuted, setHasExecuted] = useState(false);

  const frontComponentId = useFrontComponentId();

  useEffect(() => {
    if (hasExecuted) {
      return;
    }

    setHasExecuted(true);

    const run = async () => {
      try {
        const commandConfirmationModalResult =
          await openCommandConfirmationModal({
            title,
            subtitle,
            confirmButtonText,
            confirmButtonAccent,
          });

        if (commandConfirmationModalResult === 'confirm') {
          await execute();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        await enqueueSnackbar({
          message: 'Command failed',
          detailedMessage: message,
          variant: 'error',
          dedupeKey: getFrontComponentCommandErrorDedupeKey(frontComponentId),
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
