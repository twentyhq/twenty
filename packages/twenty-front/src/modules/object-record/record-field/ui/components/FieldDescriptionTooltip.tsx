import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { cloneElement, type ReactElement, useId } from 'react';
import { VisibilityHidden } from 'twenty-ui/accessibility';
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
  children: ReactElement<{
    'aria-describedby'?: string;
    id?: string;
    tabIndex?: number;
  }>;
  fieldDescription?: string | null;
  fieldLabel?: string | null;
};

export const FieldDescriptionTooltip = ({
  children,
  fieldDescription,
  fieldLabel,
}: FieldDescriptionTooltipProps) => {
  const fieldDescriptionTooltipAnchorId = `field-description-${useId().replace(/:/g, '')}`;
  const fieldDescriptionId = `${fieldDescriptionTooltipAnchorId}-description`;

  if (!isNonEmptyString(fieldLabel) || !isNonEmptyString(fieldDescription)) {
    return children;
  }

  return (
    <>
      {cloneElement(children, {
        'aria-describedby': fieldDescriptionId,
        id: fieldDescriptionTooltipAnchorId,
        tabIndex: 0,
      })}
      <VisibilityHidden>
        <span id={fieldDescriptionId}>{fieldDescription}</span>
      </VisibilityHidden>
      <AppTooltip
        anchorSelect={`#${fieldDescriptionTooltipAnchorId}`}
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
    </>
  );
};
