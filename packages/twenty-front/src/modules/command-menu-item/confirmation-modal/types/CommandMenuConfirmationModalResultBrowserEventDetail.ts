export type CommandMenuConfirmationModalResult = 'confirm' | 'cancel';

export type CommandMenuConfirmationModalResultBrowserEventDetail = {
  frontComponentId: string;
  confirmationResult: CommandMenuConfirmationModalResult;
};
