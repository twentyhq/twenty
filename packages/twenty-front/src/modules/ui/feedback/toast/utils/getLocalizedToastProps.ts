import { type I18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { isString, isUndefined } from '@sniptt/guards';
import {
  type ToastProps,
  type ToastStatus,
} from 'twenty-ui/components/feedback';

const DEFAULT_ARIA_LABEL_BY_STATUS: Record<
  ToastStatus,
  ReturnType<typeof msg>
> = {
  neutral: msg`Alert`,
  error: msg`Error`,
  info: msg`Info`,
  success: msg`Success`,
  warning: msg`Warning`,
};

export const getLocalizedToastProps = ({
  toast,
  i18n,
}: {
  toast: ToastProps;
  i18n: I18n;
}) => {
  const iconLabel =
    toast.iconLabel ??
    i18n._(DEFAULT_ARIA_LABEL_BY_STATUS[toast.status ?? 'neutral']);

  return {
    iconLabel,
    title:
      toast.title ?? (isString(toast.children) ? toast.children : iconLabel),
    cancelLabel: isUndefined(toast.cancelLabel)
      ? i18n._(msg`Cancel`)
      : toast.cancelLabel,
    closeLabel: toast.closeLabel ?? i18n._(msg`Close`),
  };
};
