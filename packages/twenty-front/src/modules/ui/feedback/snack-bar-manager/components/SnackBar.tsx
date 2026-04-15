import { sanitizeMessageToRenderInSnackbar } from '@/ui/feedback/snack-bar-manager/utils/sanitizeMessageToRenderInSnackbar';
import { styled } from '@linaria/react';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isUndefined } from '@sniptt/guards';
import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  useContext,
  useMemo,
} from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  HorizontalSeparator,
  IconAlertTriangle,
  IconInfoCircle,
  IconSquareRoundedCheck,
  IconX,
} from 'twenty-ui/display';
import { ProgressBar, useProgressAnimation } from 'twenty-ui/feedback';
import { LightButton, LightIconButton } from 'twenty-ui/input';
import { UndecoratedLink } from 'twenty-ui/navigation';
import {
  MOBILE_VIEWPORT,
  ThemeContext,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

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

const StyledContainer = styled.div`
  backdrop-filter: ${themeCssVariables.blur.medium};
  background-color: ${themeCssVariables.background.transparent.primary};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  box-sizing: border-box;
  margin-top: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]}
    ${themeCssVariables.spacing[1]};
  position: relative;
  width: 296px;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    border-radius: 0;
    width: 100%;
  }
`;

const StyledProgressBarContainer = styled.div`
  bottom: 0;
  left: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;

  & > [role='progressbar'] {
    height: 100%;
  }
`;

const StyledHeader = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledMessage = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
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
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  padding-left: ${themeCssVariables.spacing[6]};
  text-overflow: ellipsis;
  width: 200px;
`;

const StyledBottomActionContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledBottomAction = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[1]};
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
  buttonLabel,
  buttonOnClick,
  buttonTo,
  onCancel,
  onClose,
  role = 'status',
  variant = SnackBarVariant.Default,
}: SnackBarProps) => {
  const { i18n, t } = useLingui();
  const { theme } = useContext(ThemeContext);
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
  }, [iconComponent, variant, i18n, theme.icon.size.md, theme.snackBar]);

  const handleMouseEnter = () => {
    progressAnimation?.pause();
  };

  const handleMouseLeave = () => {
    progressAnimation?.play();
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
      <StyledProgressBarContainer>
        <ProgressBar
          barColor={theme.snackBar[variant].backgroundColor}
          value={progressValue}
        />
      </StyledProgressBarContainer>
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
      {isDefined(buttonLabel) &&
        (isDefined(buttonOnClick) || isDefined(buttonTo)) && (
          <StyledBottomActionContainer>
            <HorizontalSeparator noMargin />
            <StyledBottomAction>
              {isDefined(buttonTo) ? (
                <UndecoratedLink to={buttonTo}>
                  <LightButton title={buttonLabel} />
                </UndecoratedLink>
              ) : (
                <LightButton title={buttonLabel} onClick={buttonOnClick} />
              )}
            </StyledBottomAction>
          </StyledBottomActionContainer>
        )}
    </StyledContainer>
  );
};
