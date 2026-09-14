import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import {
  OverflowingTextWithTooltip,
  TooltipPosition,
} from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Text } from 'twenty-ui/typography';

const StyledLabel = styled(Text)`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  min-width: 0;
`;

type SettingsTableFirstColumnProps = {
  label: string;
  tooltipContent?: string;
};

export const SettingsTableFirstColumn = ({
  label,
  tooltipContent,
}: SettingsTableFirstColumnProps) => (
  <StyledLabel>
    <OverflowingTextWithTooltip
      text={label}
      tooltipContent={tooltipContent}
      tooltipPlace={TooltipPosition.Top}
      alwaysShowTooltip={isDefined(tooltipContent)}
      isFocusable
    />
  </StyledLabel>
);
