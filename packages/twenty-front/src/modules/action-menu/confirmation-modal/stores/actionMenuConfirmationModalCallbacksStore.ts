type ActionMenuConfirmationModalCallbacks = {
  onConfirmClick: () => void | Promise<void>;
  onClose?: () => void | Promise<void>;
};

let actionMenuConfirmationModalCallbacks: ActionMenuConfirmationModalCallbacks | null =
  null;

export const setActionMenuConfirmationModalCallbacks = (params: {
  callbacks: ActionMenuConfirmationModalCallbacks;
}) => {
  actionMenuConfirmationModalCallbacks = params.callbacks;
};

export const clearActionMenuConfirmationModalCallbacks = () => {
  actionMenuConfirmationModalCallbacks = null;
};

export const consumeActionMenuConfirmationModalCallbacks = () => {
  const currentActionMenuConfirmationModalCallbacks =
    actionMenuConfirmationModalCallbacks;

  clearActionMenuConfirmationModalCallbacks();

  return currentActionMenuConfirmationModalCallbacks;
};
