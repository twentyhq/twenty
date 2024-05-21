import { ComponentPropsWithoutRef, ReactNode, useMemo } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import {
  IconAlertTriangle,
  IconInfoCircle,
  IconSquareRoundedCheck,
  IconX,
  RGBA,
} from 'twenty-ui';

import { ProgressBar } from '@/ui/feedback/progress-bar/components/ProgressBar';
import { useProgressAnimation } from '@/ui/feedback/progress-bar/hooks/useProgressAnimation';
import { LightButton } from '@/ui/input/button/components/LightButton';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { isDefined } from '~/utils/isDefined';

export enum SnackBarVariant {
  Default = 'default',
  Error = 'error',
  Success = 'success',
  Info = 'info',
  Warning = 'warning',
}

export type SnackBarProps = Pick<
  ComponentPropsWithoutRef<'div'>,
  'id' | 'title'
> & {
  children?: ReactNode;
  className?: string;
  progress?: number;
  duration?: number;
  icon?: ReactNode;
  message?: string;
  onCancel?: () => void;
  onClose: () => void;
  role?: 'alert' | 'status';
  variant?: SnackBarVariant;
};

const StyledContainer = styled.div`
  backdrop-filter: ${({ theme }) => theme.blur.light};
  background-color: ${({ theme }) => theme.background.transparent.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  box-sizing: border-box;
  cursor: pointer;
  height: 61px;
  padding: ${({ theme }) => theme.spacing(2)};
  position: relative;
  width: 296px;
`;

const StyledProgressBar = styled(ProgressBar)`
  bottom: 0;
  height: auto;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  pointer-events: none;
`;

const StyledHeader = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(2)};
  height: ${({ theme }) => theme.spacing(6)};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  margin-left: auto;
`;

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  padding-left: ${({ theme }) => theme.spacing(6)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 200px;
`;

export const SnackBar = ({
  children,
  className,
  progress: overrideProgressValue,
  duration = 6000,
  icon: iconComponent,
  id,
  message,
  onCancel,
  onClose,
  role = 'status',
  title,
  variant = SnackBarVariant.Default,
}: SnackBarProps) => {
  const theme = useTheme();
  const { animation: progressAnimation, value: progressValue } =
    useProgressAnimation({
      autoPlay: isUndefined(overrideProgressValue),
      initialValue: isDefined(overrideProgressValue)
        ? overrideProgressValue
        : 100,
      finalValue: 0,
      options: { duration, onComplete: onClose },
    });

  const icon = useMemo(() => {
    if (isDefined(iconComponent)) {
      return iconComponent;
    }

    switch (variant) {
      case SnackBarVariant.Error:
        return (
          <IconAlertTriangle
            aria-label="Error"
            color={theme.snackBar.color.error}
            size={theme.icon.size.md}
          />
        );
      case SnackBarVariant.Info:
        return (
          <IconInfoCircle
            aria-label="Info"
            color={theme.snackBar.color.info}
            size={theme.icon.size.md}
          />
        );
      case SnackBarVariant.Success:
        return (
          <IconSquareRoundedCheck
            aria-label="Success"
            color={theme.snackBar.color.success}
            size={theme.icon.size.md}
          />
        );
      case SnackBarVariant.Warning:
        return (
          <IconAlertTriangle
            aria-label="Warning"
            color={theme.snackBar.color.warning}
            size={theme.icon.size.md}
          />
        );
      default:
        return (
          <IconAlertTriangle aria-label="Alert" size={theme.icon.size.md} />
        );
    }
  }, [
    iconComponent,
    theme.icon.size.md,
    theme.snackBar.color.error,
    theme.snackBar.color.info,
    theme.snackBar.color.success,
    theme.snackBar.color.warning,
    variant,
  ]);

  const handleMouseEnter = () => {
    if (progressAnimation?.state === 'running') {
      progressAnimation.pause();
    }
  };

  const handleMouseLeave = () => {
    if (progressAnimation?.state === 'paused') {
      progressAnimation.play();
    }
  };

  const progressBarColor = useMemo(
    () => RGBA(theme.snackBar.color[variant], 0.04),
    [theme.snackBar.color, variant],
  );

  return (
    <StyledContainer
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...{ className, id, role, title, variant }}
    >
      <StyledProgressBar color={progressBarColor} value={progressValue} />
      <StyledHeader>
        {icon}
        {title}
        <StyledActions>
          {!!onCancel && <LightButton title="Cancel" onClick={onCancel} />}
          <LightIconButton title="Close" Icon={IconX} onClick={onClose} />
        </StyledActions>
      </StyledHeader>
      <StyledDescription>{children || message}</StyledDescription>
    </StyledContainer>
  );
};
