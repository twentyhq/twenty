export type CommandMenuItemConfirmationModalResult = 'confirm' | 'cancel';

export type CommandMenuItemConfirmationModalResultBrowserEventDetail = {
  frontComponentId: string;
  confirmationResult: CommandMenuItemConfirmationModalResult;
};
