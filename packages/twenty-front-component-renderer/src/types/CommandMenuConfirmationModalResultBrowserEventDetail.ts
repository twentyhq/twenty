import { type CommandConfirmationModalResult } from 'twenty-sdk/front-component';
import { type ConfirmationModalCaller } from 'twenty-shared/types';

export type CommandMenuConfirmationModalResultBrowserEventDetail = {
  caller: ConfirmationModalCaller;
  confirmationResult: CommandConfirmationModalResult;
};
