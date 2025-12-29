import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import {
  AppTooltip,
  type IconComponent,
  IconAlertTriangle,
  IconInfoCircle,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

type AIChatBannerVariant = 'default' | 'warning';

const StyledBanner = styled.div<{ variant: AIChatBannerVariant }>`
  align-items: center;
  background-color: ${({ theme, variant }) =>
    variant === 'warning'
      ? theme.background.transparent.orange
      : theme.accent.secondary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledIconContainer = styled.div<{ variant: AIChatBannerVariant }>`
  align-items: center;
  color: ${({ theme, variant }) =>
    variant === 'warning' ? theme.color.orange : theme.color.blue};
  display: flex;
  flex-shrink: 0;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const StyledMessage = styled.p<{ variant: AIChatBannerVariant }>`
  color: ${({ theme, variant }) =>
    variant === 'warning' ? theme.color.orange : theme.color.blue};
  flex-grow: 1;
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-style: normal;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: 1.4;
  margin: 0;
  min-width: 0;
`;

export type AIChatBannerProps = {
  message: string;
  variant?: AIChatBannerVariant;
  tooltipMessage?: string;
  buttonTitle?: string;
  buttonIcon?: IconComponent;
  buttonOnClick?: () => void;
  isButtonDisabled?: boolean;
  isButtonLoading?: boolean;
};

export const AIChatBanner = ({
  message,
  variant = 'default',
  tooltipMessage,
  buttonTitle,
  buttonIcon,
  buttonOnClick,
  isButtonDisabled = false,
  isButtonLoading = false,
}: AIChatBannerProps) => {
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
