import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { Pill } from 'twenty-ui/data-display';
import { IconInfoCircle } from 'twenty-ui/icon';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const APPLICATION_VARIABLE_DESCRIPTION_ICON_SIZE = 14;

const StyledLabelRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[1]};
  margin-bottom: ${() => themeCssVariables.spacing[1]};
`;

const StyledLabel = styled.label`
  color: ${() => themeCssVariables.font.color.light};
  font-family: ${() => themeCssVariables.font.family};
  font-size: 11px;
  font-weight: ${() => themeCssVariables.font.weight.semiBold};
`;

const StyledDescriptionIconContainer = styled.span`
  align-items: center;
  color: ${() => themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
`;

type ApplicationVariableLabelRowProps = {
  variableKey: string;
  description: string;
  isDeprecated: boolean;
  inputId: string;
  tooltipId: string;
};

export const ApplicationVariableLabelRow = ({
  variableKey,
  description,
  isDeprecated,
  inputId,
  tooltipId,
}: ApplicationVariableLabelRowProps) => (
  <StyledLabelRow>
    <StyledLabel htmlFor={inputId}>{variableKey}</StyledLabel>
    {isDeprecated && <Pill label="Deprecated" />}
    {isNonEmptyString(description) && (
      <>
        <StyledDescriptionIconContainer id={tooltipId}>
          <IconInfoCircle size={APPLICATION_VARIABLE_DESCRIPTION_ICON_SIZE} />
        </StyledDescriptionIconContainer>
        <AppTooltip
          anchorSelect={`#${tooltipId}`}
          content={description}
          offset={5}
          noArrow
          place="bottom"
          positionStrategy="fixed"
          delay={TooltipDelay.shortDelay}
        />
      </>
    )}
  </StyledLabelRow>
);
