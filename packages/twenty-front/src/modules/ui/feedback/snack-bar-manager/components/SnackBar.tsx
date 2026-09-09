import { sanitizeMessageToRenderInSnackbar } from '@/ui/feedback/snack-bar-manager/utils/sanitizeMessageToRenderInSnackbar';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Toast } from 'twenty-ui/feedback';
import { LightButton } from 'twenty-ui/input';
import { UndecoratedLink } from 'twenty-ui/navigation';

export enum SnackBarVariant {
  Default = 'default',
  Error = 'error',
  Success = 'success',
  Info = 'info',
  Warning = 'warning',
}

export type SnackBarProps = Pick<ComponentPropsWithoutRef<'div'>, 'id'> & {
  className?: string;
  progress?: number;
  duration?: number;
  icon?: ReactNode;
  message: string;
  buttonLabel?: string;
  buttonOnClick?: () => void;
  buttonTo?: string;
  detailedMessage?: string;
  onCancel?: () => void;
  onClose?: () => void;
  role?: 'alert' | 'status';
  variant?: SnackBarVariant;
  dedupeKey?: string;
};

const DEFAULT_ARIA_LABEL_BY_VARIANT: Record<
  SnackBarVariant,
  ReturnType<typeof msg>
> = {
  [SnackBarVariant.Default]: msg`Alert`,
  [SnackBarVariant.Error]: msg`Error`,
  [SnackBarVariant.Info]: msg`Info`,
  [SnackBarVariant.Success]: msg`Success`,
  [SnackBarVariant.Warning]: msg`Warning`,
};

export const SnackBar = ({
  className,
  progress,
  duration,
  icon,
  id,
  message,
  detailedMessage,
  buttonLabel,
  buttonOnClick,
  buttonTo,
  onCancel,
  onClose,
  role,
  variant = SnackBarVariant.Default,
}: SnackBarProps) => {
  const { i18n, t } = useLingui();
  const iconLabel = i18n._(DEFAULT_ARIA_LABEL_BY_VARIANT[variant]);
  const sanitizedMessage = sanitizeMessageToRenderInSnackbar(message);
  const sanitizedDetailedMessage =
    sanitizeMessageToRenderInSnackbar(detailedMessage);

  const hasAction =
    isDefined(buttonLabel) && (isDefined(buttonOnClick) || isDefined(buttonTo));
  const action = isDefined(buttonTo) ? (
    <UndecoratedLink to={buttonTo}>
      <LightButton title={buttonLabel} />
    </UndecoratedLink>
  ) : (
    <LightButton title={buttonLabel} onClick={buttonOnClick} />
  );

  return (
    <Toast
      className={className}
      progress={progress}
      duration={duration}
      icon={icon}
      iconLabel={iconLabel}
      id={id}
      onCancel={onCancel}
      onClose={onClose}
      role={role}
      variant={variant}
      title={sanitizedMessage ?? iconLabel}
      description={sanitizedDetailedMessage}
      cancelLabel={t`Cancel`}
      closeLabel={t`Close`}
      action={hasAction ? action : undefined}
      data-globally-prevent-click-outside
    >
      {sanitizedMessage ?? ''}
    </Toast>
  );
};
