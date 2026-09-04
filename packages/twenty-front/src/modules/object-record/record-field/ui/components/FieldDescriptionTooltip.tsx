import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const fieldDescriptionTooltipClassName = css`
  padding: ${themeCssVariables.spacing[3]} !important;
`;

const StyledTooltipContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  line-height: 1.4;
  max-width: 300px;
`;

const StyledFieldLabel = styled.div`
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledFieldDescription = styled.div`
  overflow-wrap: anywhere;
  white-space: pre-wrap;
`;

type FieldDescriptionTooltipProps = {
  anchorSelect: string;
  fieldDescription?: string | null;
  fieldLabel?: string | null;
};

export const FieldDescriptionTooltip = ({
  anchorSelect,
  fieldDescription,
  fieldLabel,
}: FieldDescriptionTooltipProps) => {
  if (!isNonEmptyString(fieldLabel) || !isNonEmptyString(fieldDescription)) {
    return null;
  }

  return (
    <AppTooltip
      anchorSelect={anchorSelect}
      className={fieldDescriptionTooltipClassName}
      delay={TooltipDelay.longDelay}
      noArrow
      place="bottom"
      positionStrategy="fixed"
      width="300px"
    >
      <StyledTooltipContent>
        <StyledFieldLabel>{fieldLabel}</StyledFieldLabel>
        <StyledFieldDescription>{fieldDescription}</StyledFieldDescription>
      </StyledTooltipContent>
    </AppTooltip>
  );
};
