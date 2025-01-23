import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { isUndefined } from '@sniptt/guards';
import { ComponentPropsWithoutRef, ReactNode, useMemo } from 'react';
import {
  IconAlertTriangle,
  IconInfoCircle,
  IconSquareRoundedCheck,
  IconX,
  LightButton,
  LightIconButton,
  MOBILE_VIEWPORT,
  ProgressBar,
  useProgressAnimation,
} from 'twenty-ui';

import { isDefined } from '~/utils/isDefined';

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
  detailedMessage?: string;
  onCancel?: () => void;
  onClose?: () => void;
  role?: 'alert' | 'status';
  variant?: SnackBarVariant;
  dedupeKey?: string;
};

const StyledContainer = styled.div`
  backdrop-filter: ${({ theme }) => theme.blur.medium};
  background-color: ${({ theme }) => theme.background.transparent.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  box-sizing: border-box;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing(2)};
  position: relative;
  width: 296px;
  margin-top: ${({ theme }) => theme.spacing(2)};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    border-radius: 0;
    width: 100%;
  }
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
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledMessage = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledIcon = styled.div`
  align-items: center;
  display: flex;
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
  width: 200px;
`;

const defaultAriaLabelByVariant: Record<SnackBarVariant, string> = {
  [SnackBarVariant.Default]: 'Alert',
  [SnackBarVariant.Error]: 'Error',
  [SnackBarVariant.Info]: 'Info',
  [SnackBarVariant.Success]: 'Success',
  [SnackBarVariant.Warning]: 'Warning',
};

export const SnackBar = ({
  className,
  progress: overrideProgressValue,
  duration = 6000,
  icon: iconComponent,
  id,
  message,
  detailedMessage,
  onCancel,
  onClose,
  role = 'status',
  variant = SnackBarVariant.Default,
}: SnackBarProps) => {
  const theme = useTheme();
  const { t } = useLingui();
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

    const ariaLabel = defaultAriaLabelByVariant[variant];
    const color = theme.snackBar[variant].color;
    const size = theme.icon.size.md;

    switch (variant) {
      case SnackBarVariant.Error:
        return (
          <IconAlertTriangle {...{ 'aria-label': ariaLabel, color, size }} />
        );
      case SnackBarVariant.Info:
        return <IconInfoCircle {...{ 'aria-label': ariaLabel, color, size }} />;
      case SnackBarVariant.Success:
        return (
          <IconSquareRoundedCheck
            {...{ 'aria-label': ariaLabel, color, size }}
          />
        );
      case SnackBarVariant.Warning:
        return (
          <IconAlertTriangle {...{ 'aria-label': ariaLabel, color, size }} />
        );
      default:
        return (
          <IconAlertTriangle {...{ 'aria-label': ariaLabel, color, size }} />
        );
    }
  }, [iconComponent, theme.icon.size.md, theme.snackBar, variant]);

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

  return (
    <StyledContainer
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={message || defaultAriaLabelByVariant[variant]}
      {...{ className, id, role, variant }}
    >
      <StyledProgressBar
        color={theme.snackBar[variant].backgroundColor}
        value={progressValue}
      />
      <StyledHeader>
        <StyledIcon>{icon}</StyledIcon>
        <StyledMessage>{message}</StyledMessage>
        <StyledActions>
          {!!onCancel && <LightButton title={t`Cancel`} onClick={onCancel} />}

          {!!onClose && (
            <LightIconButton title={t`Close`} Icon={IconX} onClick={onClose} />
          )}
        </StyledActions>
      </StyledHeader>
      {detailedMessage && (
        <StyledDescription>{detailedMessage}</StyledDescription>
      )}
    </StyledContainer>
  );
};
