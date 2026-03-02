export type ActionMenuConfirmationModalResult = 'confirm' | 'cancel';

export type ActionMenuConfirmationModalResultBrowserEventDetail = {
  requesterId: string;
  result: ActionMenuConfirmationModalResult;
};
