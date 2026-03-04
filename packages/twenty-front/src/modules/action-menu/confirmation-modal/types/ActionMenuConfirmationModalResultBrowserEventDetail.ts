export type ActionMenuConfirmationModalResult = 'confirm' | 'cancel';

export type ActionMenuConfirmationModalResultBrowserEventDetail = {
  frontComponentId: string;
  result: ActionMenuConfirmationModalResult;
};
