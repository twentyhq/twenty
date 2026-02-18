import { isDefined } from 'twenty-shared/utils';

export type OpenConfirmationModalParams = {
  title: string;
  subtitle: string;
  confirmButtonText?: string;
  confirmButtonAccent?: 'danger' | 'default' | 'blue';
};

type OpenConfirmationModalFunction = (
  params: OpenConfirmationModalParams,
) => Promise<boolean>;

const OPEN_CONFIRMATION_MODAL_KEY =
  '__twentySdkOpenConfirmationModalFunction__';

export const setOpenConfirmationModal = (
  fn: OpenConfirmationModalFunction,
): void => {
  (globalThis as Record<string, unknown>)[OPEN_CONFIRMATION_MODAL_KEY] = fn;
};

export const openConfirmationModal: OpenConfirmationModalFunction = (
  params: OpenConfirmationModalParams,
): Promise<boolean> => {
  const openConfirmationModalFunction = (globalThis as Record<string, unknown>)[
    OPEN_CONFIRMATION_MODAL_KEY
  ] as OpenConfirmationModalFunction | undefined;

  if (!isDefined(openConfirmationModalFunction)) {
    throw new Error('openConfirmationModalFunction is not set');
  }

  return openConfirmationModalFunction(params);
};
