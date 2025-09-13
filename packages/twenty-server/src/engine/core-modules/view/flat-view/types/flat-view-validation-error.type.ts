import { type ViewExceptionCode } from 'src/engine/core-modules/view/exceptions/view.exception';

export type FlatViewValidationError = {
  code: ViewExceptionCode;
  message: string;
  userFriendlyMessage?: string;
  value?: unknown;
};
