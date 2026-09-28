import { useContext, type ReactNode } from 'react';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { Dialog, type DialogPopupProps } from 'twenty-ui/primitives/surfaces';

import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { DialogEnterHotkeyEffect } from '@/ui/layout/dialog/components/DialogEnterHotkeyEffect';
import { DIALOG_BACKDROP_CLICK_OUTSIDE_ID } from '@/ui/layout/dialog/constants/DialogBackdropClickOutsideId';
import { DIALOG_CLICK_OUTSIDE_LISTENER_EXCLUDED_ID } from '@/ui/layout/dialog/constants/DialogClickOutsideListenerExcludedClassName';
import { DialogComponentInstanceContext } from '@/ui/layout/dialog/contexts/DialogComponentInstanceContext';
import { DialogContainerContext } from '@/ui/layout/dialog/contexts/DialogContainerContext';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { isDialogOpenedComponentState } from '@/ui/layout/dialog/states/isDialogOpenedComponentState';
import { isDialogDismissalExcluded } from '@/ui/layout/dialog/utils/isDialogDismissalExcluded';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type DialogInstanceProps = {
  dialogId: string;
  children: (popupProps: DialogPopupProps) => ReactNode;
  onEnter?: () => void;
  onClose?: () => void;
  dismissible?: boolean;
  closeOnDismiss?: boolean;
  renderInDocumentBody?: boolean;
};

const PROPAGATED_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
]);

export const DialogInstance = ({
  dialogId,
  children,
  onEnter,
  onClose,
  dismissible = false,
  closeOnDismiss = true,
  renderInDocumentBody = false,
}: DialogInstanceProps) => {
  const store = useStore();
  const { container } = useContext(DialogContainerContext);
  const isInContainer = isDefined(container) && !renderInDocumentBody;
  const isDialogOpened = useAtomComponentStateValue(
    isDialogOpenedComponentState,
    dialogId,
  );
  const { openDialog, closeDialog } = useDialog();
  const position = isInContainer ? 'absolute' : 'fixed';

  const popupProps: DialogPopupProps = {
    container: renderInDocumentBody ? document.body : (container ?? undefined),
    backdrop: {
      style: {
        position,
        zIndex: RootStackingContextZIndices.RootModalBackDrop,
        background: isInContainer
          ? 'var(--t-background-overlay-tertiary)'
          : undefined,
      },
    },
    viewportProps: {
      render: (
        <div
          data-testid="dialog-viewport"
          data-click-outside-id={DIALOG_BACKDROP_CLICK_OUTSIDE_ID}
        />
      ),
      style: { position, zIndex: RootStackingContextZIndices.RootModal },
      onMouseDown: (event) => event.stopPropagation(),
    },
    onKeyDown: (event) => {
      const isNestedFocus = store.get(currentFocusIdSelector.atom) !== dialogId;
      if (
        PROPAGATED_KEYS.has(event.key) ||
        (event.key === 'Escape' && isNestedFocus)
      ) {
        event.preventBaseUIHandler();
      }
    },
  };

  return (
    <DialogComponentInstanceContext.Provider value={{ instanceId: dialogId }}>
      <ClickOutsideListenerContext.Provider
        value={{
          excludedClickOutsideId: DIALOG_CLICK_OUTSIDE_LISTENER_EXCLUDED_ID,
        }}
      >
        <Dialog.Root
          open={isDialogOpened}
          modal={!isInContainer}
          onOpenChange={(open, eventDetails) => {
            if (open) {
              openDialog(dialogId);
              return;
            }

            const isNestedEscape =
              eventDetails.reason === 'escape-key' &&
              store.get(currentFocusIdSelector.atom) !== dialogId;

            if (isNestedEscape) {
              eventDetails.cancel();
              eventDetails.allowPropagation();
              return;
            }

            const isDismissal =
              eventDetails.reason === 'escape-key' ||
              eventDetails.reason === 'outside-press';
            const isExcludedPress =
              eventDetails.reason === 'outside-press' &&
              isDialogDismissalExcluded(eventDetails.event.target);

            if ((isDismissal && !dismissible) || isExcludedPress) {
              eventDetails.cancel();
              return;
            }

            onClose?.();

            if (isDismissal && !closeOnDismiss) {
              eventDetails.cancel();
              return;
            }

            closeDialog(dialogId);
          }}
        >
          {isDialogOpened && isDefined(onEnter) && (
            <DialogEnterHotkeyEffect dialogId={dialogId} onEnter={onEnter} />
          )}
          {children(popupProps)}
        </Dialog.Root>
      </ClickOutsideListenerContext.Provider>
    </DialogComponentInstanceContext.Provider>
  );
};
