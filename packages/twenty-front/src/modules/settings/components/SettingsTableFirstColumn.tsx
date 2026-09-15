import { type ReactNode } from 'react';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import {
  OverflowingTextWithTooltip,
  TooltipPosition,
} from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Text } from 'twenty-ui/typography';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledLeadingContent = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-shrink: 0;
`;

const StyledLabel = styled(Text)`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  min-width: 0;
`;

type SettingsTableFirstColumnProps = {
  label: string;
  leadingContent?: ReactNode;
  tooltipContent?: string;
  isFocusable?: boolean;
};

export const SettingsTableFirstColumn = ({
  label,
  leadingContent,
  tooltipContent,
  isFocusable = false,
}: SettingsTableFirstColumnProps) => (
  <StyledContainer>
    {isDefined(leadingContent) && (
      <StyledLeadingContent>{leadingContent}</StyledLeadingContent>
    )}
    <StyledLabel>
      <OverflowingTextWithTooltip
        text={<>{label}</>}
        tooltipContent={tooltipContent ?? label}
        tooltipPlace={TooltipPosition.Top}
        alwaysShowTooltip={isDefined(tooltipContent)}
        isFocusable={isFocusable}
      />
    </StyledLabel>
  </StyledContainer>
);
