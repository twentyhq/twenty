import { sanitizeMessageToRenderInSnackbar } from '@/ui/feedback/snack-bar-manager/utils/sanitizeMessageToRenderInSnackbar';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isUndefined } from '@sniptt/guards';
import { type ComponentPropsWithoutRef, type ReactNode, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import {
  IconAlertTriangle,
  IconInfoCircle,
  IconSquareRoundedCheck,
  IconX,
} from 'twenty-ui/display';
import { ProgressBar, useProgressAnimation } from 'twenty-ui/feedback';
import { LightButton, LightIconButton } from 'twenty-ui/input';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

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
  actionText?: string;
  actionOnClick?: () => void;
  actionTo?: string;
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

const StyledLink = styled(Link)`
  display: block;
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  padding-left: ${({ theme }) => theme.spacing(6)};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 200px;
  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

const StyledActionButton = styled.div`
  padding-left: ${({ theme }) => theme.spacing(6)};
`;

const defaultAriaLabelByVariant: Record<
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
  progress: overrideProgressValue,
  duration = 6000,
  icon: iconComponent,
  id,
  message,
  detailedMessage,
  actionText,
  actionOnClick,
  actionTo,
  onCancel,
  onClose,
  role = 'status',
  variant = SnackBarVariant.Default,
}: SnackBarProps) => {
  const theme = useTheme();
  const { i18n, t } = useLingui();
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

    const ariaLabel = i18n._(defaultAriaLabelByVariant[variant]);
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
  }, [iconComponent, theme.icon.size.md, theme.snackBar, variant, i18n]);

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

  const sanitizedMessage = sanitizeMessageToRenderInSnackbar(message);
  const sanitizedDetailedMessage =
    sanitizeMessageToRenderInSnackbar(detailedMessage);

  return (
    <StyledContainer
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={sanitizedMessage ?? i18n._(defaultAriaLabelByVariant[variant])}
      className={className}
      id={id}
      role={role}
      data-globally-prevent-click-outside
    >
      <StyledProgressBar
        barColor={theme.snackBar[variant].backgroundColor}
        value={progressValue}
      />
      <StyledHeader>
        <StyledIcon>{icon}</StyledIcon>
        <StyledMessage>{sanitizedMessage ?? ''}</StyledMessage>
        <StyledActions>
          {!!onCancel && <LightButton title={t`Cancel`} onClick={onCancel} />}

          {!!onClose && (
            <LightIconButton title={t`Close`} Icon={IconX} onClick={onClose} />
          )}
        </StyledActions>
      </StyledHeader>
      {isDefined(sanitizedDetailedMessage) && (
        <StyledDescription>{sanitizedDetailedMessage}</StyledDescription>
      )}
      {actionText && actionTo && (
        <StyledLink to={actionTo}>{actionText}</StyledLink>
      )}
      {actionText && actionOnClick && !actionTo && (
        <StyledActionButton>
          <LightButton title={actionText} onClick={actionOnClick} />
        </StyledActionButton>
      )}
    </StyledContainer>
  );
};
