export type CommandMenuConfirmationModalResult = 'confirm' | 'cancel';

export type CommandMenuConfirmationModalResultBrowserEventDetail = {
  callerId: string;
  confirmationResult: CommandMenuConfirmationModalResult;
};
