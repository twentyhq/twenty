import { type ToastOptions } from 'twenty-ui/feedback';

export type SnackBarOptions = Pick<
  ToastOptions,
  | 'className'
  | 'progress'
  | 'duration'
  | 'icon'
  | 'onCancel'
  | 'onClose'
  | 'variant'
  | 'dedupeKey'
> & {
  id: string;
  message: string;
  buttonLabel?: string;
  buttonOnClick?: () => void;
  buttonTo?: string;
  detailedMessage?: string;
  role?: 'alert' | 'status';
};
