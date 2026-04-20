import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import {
  AppTooltip,
  type IconComponent,
  IconAlertTriangle,
  IconInfoCircle,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type AiChatBannerVariant = 'default' | 'warning';

const StyledBanner = styled.div<{ variant: AiChatBannerVariant }>`
  align-items: center;
  background-color: ${({ variant }) =>
    variant === 'warning'
      ? themeCssVariables.background.transparent.orange
      : themeCssVariables.accent.secondary};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledIconContainer = styled.div<{ variant: AiChatBannerVariant }>`
  align-items: center;
  color: ${({ variant }) =>
    variant === 'warning'
      ? themeCssVariables.color.orange
      : themeCssVariables.color.blue};
  display: flex;
  flex-shrink: 0;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const StyledMessage = styled.p<{ variant: AiChatBannerVariant }>`
  color: ${({ variant }) =>
    variant === 'warning'
      ? themeCssVariables.color.orange
      : themeCssVariables.color.blue};
  flex-grow: 1;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.sm};
  font-style: normal;
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 1.4;
  margin: 0;
  min-width: 0;
`;

export type AiChatBannerProps = {
  message: string;
  variant?: AiChatBannerVariant;
  tooltipMessage?: string;
  buttonTitle?: string;
  buttonIcon?: IconComponent;
  buttonOnClick?: () => void;
  isButtonDisabled?: boolean;
  isButtonLoading?: boolean;
};

export const AiChatBanner = ({
  message,
  variant = 'default',
  tooltipMessage,
  buttonTitle,
  buttonIcon,
  buttonOnClick,
  isButtonDisabled = false,
  isButtonLoading = false,
}: AiChatBannerProps) => {
  const tooltipId = 'ai-chat-banner-tooltip';

  return (
    <StyledBanner
      variant={variant}
      data-tooltip-id={tooltipMessage ? tooltipId : undefined}
    >
      <StyledIconContainer variant={variant}>
        {variant === 'default' ? (
          <IconInfoCircle size={16} />
        ) : (
          <IconAlertTriangle size={16} />
        )}
      </StyledIconContainer>
      <StyledMessage variant={variant}>{message}</StyledMessage>
      {isDefined(buttonTitle) && isDefined(buttonOnClick) && (
        <Button
          variant="secondary"
          size="small"
          Icon={buttonIcon}
          onClick={buttonOnClick}
          disabled={isButtonDisabled || isButtonLoading}
          title={buttonTitle}
        />
      )}
      {isDefined(tooltipMessage) && (
        <AppTooltip
          anchorSelect={`[data-tooltip-id='${tooltipId}']`}
          content={tooltipMessage}
          place="bottom"
        />
      )}
    </StyledBanner>
  );
};
