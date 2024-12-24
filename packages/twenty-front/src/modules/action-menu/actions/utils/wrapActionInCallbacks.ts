import { ActionMenuEntry } from '@/action-menu/types/ActionMenuEntry';
import { isDefined } from 'twenty-ui';

export const wrapActionInCallbacks = ({
  action,
  onActionStartedCallback,
  onActionExecutedCallback,
}: {
  action: ActionMenuEntry;
  onActionStartedCallback?: (action: { key: string }) => Promise<void> | void;
  onActionExecutedCallback?: (action: { key: string }) => Promise<void> | void;
}) => {
  const onClickWithCallbacks = isDefined(action.ConfirmationModal)
    ? action.onClick
    : async () => {
        await onActionStartedCallback?.({ key: action.key });
        await action.onClick?.();
        await onActionExecutedCallback?.({ key: action.key });
      };

  const ConfirmationModalWithCallbacks = isDefined(action.ConfirmationModal)
    ? {
        ...action.ConfirmationModal,
        props: {
          ...action.ConfirmationModal.props,
          onConfirmClick: async () => {
            await onActionStartedCallback?.({ key: action.key });
            await action.ConfirmationModal?.props.onConfirmClick?.();
            await onActionExecutedCallback?.({ key: action.key });
          },
        },
      }
    : undefined;

  return {
    ...action,
    onClick: onClickWithCallbacks,
    ConfirmationModal: ConfirmationModalWithCallbacks,
  };
};
