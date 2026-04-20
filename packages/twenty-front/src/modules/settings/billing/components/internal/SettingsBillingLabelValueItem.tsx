import { styled } from '@linaria/react';
import { AppTooltip, IconInfoCircle, TooltipDelay } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsBillingLabelValueItemProps = {
  label: string;
  value: string;
  isValueInPrimaryColor?: boolean;
  tooltipText?: string;
  tooltipId?: string;
};

const StyledContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledLabelWrapper = styled.span`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledLabelSpan = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledInfoIcon = styled(IconInfoCircle)`
  color: ${themeCssVariables.font.color.tertiary};
  cursor: default;
  flex-shrink: 0;
`;

const StyledValueSpan = styled.span<{ isPrimaryColor: boolean }>`
  color: ${({ isPrimaryColor }) =>
    isPrimaryColor
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

export const SettingsBillingLabelValueItem = ({
  label,
  value,
  isValueInPrimaryColor = false,
  tooltipText,
  tooltipId,
}: SettingsBillingLabelValueItemProps) => {
  return (
    <StyledContainer>
      <StyledLabelWrapper>
        <StyledLabelSpan>{label}</StyledLabelSpan>
        {tooltipText && tooltipId && (
          <>
            <StyledInfoIcon id={tooltipId} size={12} />
            <AppTooltip
              anchorSelect={`#${tooltipId}`}
              content={tooltipText}
              noArrow={false}
              place="top"
              delay={TooltipDelay.shortDelay}
              positionStrategy="fixed"
            />
          </>
        )}
      </StyledLabelWrapper>
      <StyledValueSpan isPrimaryColor={isValueInPrimaryColor}>
        {value}
      </StyledValueSpan>
    </StyledContainer>
  );
};
