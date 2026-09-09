import { getLocalizedToastProps } from '@/ui/feedback/snack-bar-manager/utils/getLocalizedToastProps';
import { getToastPropsFromSnackBarProps } from '@/ui/feedback/snack-bar-manager/utils/getToastPropsFromSnackBarProps';
import { useLingui } from '@lingui/react/macro';
import { type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { Toast } from 'twenty-ui/feedback';

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

export const SnackBar = (props: SnackBarProps) => {
  const { i18n } = useLingui();
  const toastProps = getToastPropsFromSnackBarProps(props);
  const {
    className,
    progress,
    duration,
    icon,
    iconLabel,
    id,
    onCancel,
    onClose,
    role,
    variant,
    title,
    description,
    cancelLabel,
    closeLabel,
    action,
    children,
  } = {
    ...toastProps,
    ...getLocalizedToastProps(toastProps, i18n),
  };

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
      title={title}
      description={description}
      cancelLabel={cancelLabel}
      closeLabel={closeLabel}
      action={action}
      data-globally-prevent-click-outside
    >
      {children}
    </Toast>
  );
};
