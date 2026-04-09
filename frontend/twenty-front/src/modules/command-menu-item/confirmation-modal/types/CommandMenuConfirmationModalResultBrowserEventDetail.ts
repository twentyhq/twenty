import { type ConfirmationModalCaller } from 'twenty-shared/types';

export type CommandMenuConfirmationModalResult = 'confirm' | 'cancel';

export type CommandMenuConfirmationModalResultBrowserEventDetail = {
  caller: ConfirmationModalCaller;
  confirmationResult: CommandMenuConfirmationModalResult;
};
