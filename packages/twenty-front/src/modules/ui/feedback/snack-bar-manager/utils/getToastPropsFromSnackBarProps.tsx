import { type SnackBarProps } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { sanitizeMessageToRenderInSnackbar } from '@/ui/feedback/snack-bar-manager/utils/sanitizeMessageToRenderInSnackbar';
import { type I18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { type ToastVariant } from 'twenty-ui/feedback';
import { LightButton } from 'twenty-ui/input';
import { UndecoratedLink } from 'twenty-ui/navigation';

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

export const getToastPropsFromSnackBarProps = (
  {
    message,
    detailedMessage,
    buttonLabel,
    buttonOnClick,
    buttonTo,
    variant,
    ...props
  }: SnackBarProps,
  i18n: I18n,
) => {
  const toastVariant: ToastVariant = variant ?? 'default';
  const iconLabel = i18n._(DEFAULT_ARIA_LABEL_BY_VARIANT[toastVariant]);
  const sanitizedMessage = sanitizeMessageToRenderInSnackbar(message);
  const hasAction =
    isDefined(buttonLabel) && (isDefined(buttonOnClick) || isDefined(buttonTo));
  const action = isDefined(buttonTo) ? (
    <UndecoratedLink to={buttonTo}>
      <LightButton title={buttonLabel} />
    </UndecoratedLink>
  ) : (
    <LightButton title={buttonLabel} onClick={buttonOnClick} />
  );

  return {
    ...props,
    variant: toastVariant,
    iconLabel,
    title: sanitizedMessage ?? iconLabel,
    children: sanitizedMessage ?? '',
    description: sanitizeMessageToRenderInSnackbar(detailedMessage),
    cancelLabel: i18n._(msg`Cancel`),
    closeLabel: i18n._(msg`Close`),
    action: hasAction ? action : undefined,
  };
};
