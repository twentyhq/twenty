import { type CommandConfirmationModalResult } from 'twenty-sdk/front-component';

export type CommandConfirmationModalPromiseCallbacks = {
  resolve: (result: CommandConfirmationModalResult) => void;
  reject: (error: Error) => void;
};
