import { type I18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { isString } from '@sniptt/guards';
import { type ToastProps, type ToastVariant } from 'twenty-ui/components';

const DEFAULT_ARIA_LABEL_BY_VARIANT: Record<
  ToastVariant,
  ReturnType<typeof msg>
> = {
  default: msg`Alert`,
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
    i18n._(DEFAULT_ARIA_LABEL_BY_VARIANT[toast.variant ?? 'default']);

  return {
    iconLabel,
    title:
      toast.title ?? (isString(toast.children) ? toast.children : iconLabel),
    cancelLabel: toast.cancelLabel ?? i18n._(msg`Cancel`),
    closeLabel: toast.closeLabel ?? i18n._(msg`Close`),
  };
};
