import { useRef } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react';

import { useRsi } from '../../hooks/useRsi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const SubmitDataAlert = ({ isOpen, onClose, onConfirm }: Props) => {
  const { allowInvalidSubmit, translations } = useRsi();
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={cancelRef}
      isCentered
      id="rsi"
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {translations.alerts.submitIncomplete.headerTitle}
          </AlertDialogHeader>
          <AlertDialogBody>
            {allowInvalidSubmit
              ? translations.alerts.submitIncomplete.bodyText
              : translations.alerts.submitIncomplete.bodyTextSubmitForbidden}
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} variant="secondary">
              {translations.alerts.submitIncomplete.cancelButtonTitle}
            </Button>
            {allowInvalidSubmit && (
              <Button onClick={onConfirm} ml={3}>
                {translations.alerts.submitIncomplete.finishButtonTitle}
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
