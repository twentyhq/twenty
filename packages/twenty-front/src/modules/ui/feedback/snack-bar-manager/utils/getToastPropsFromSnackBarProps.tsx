import { type SnackBarOptions } from '@/ui/feedback/snack-bar-manager/types/SnackBarOptions';
import { sanitizeMessageToRenderInSnackbar } from '@/ui/feedback/snack-bar-manager/utils/sanitizeMessageToRenderInSnackbar';
import { isDefined } from 'twenty-shared/utils';
import { type ToastVariant } from 'twenty-ui/feedback';
import { Button, LightButton } from 'twenty-ui/input';

export const getToastPropsFromSnackBarProps = ({
  message,
  detailedMessage,
  buttonLabel,
  buttonOnClick,
  buttonTo,
  variant,
  ...props
}: SnackBarOptions) => {
  const toastVariant: ToastVariant = variant ?? 'default';
  const sanitizedMessage = sanitizeMessageToRenderInSnackbar(message);
  const hasAction =
    isDefined(buttonLabel) && (isDefined(buttonOnClick) || isDefined(buttonTo));
  const action = isDefined(buttonTo) ? (
    <Button
      to={buttonTo}
      title={buttonLabel}
      ariaLabel={buttonLabel}
      variant="tertiary"
      size="small"
    />
  ) : (
    <LightButton title={buttonLabel} onClick={buttonOnClick} />
  );

  return {
    ...props,
    variant: toastVariant,
    title: sanitizedMessage ?? undefined,
    children: sanitizedMessage ?? '',
    description: sanitizeMessageToRenderInSnackbar(detailedMessage),
    action: hasAction ? action : undefined,
  };
};
