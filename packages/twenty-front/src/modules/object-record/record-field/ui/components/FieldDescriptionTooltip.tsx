import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { cloneElement, type ReactElement, useId } from 'react';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTooltipContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  line-height: ${themeCssVariables.text.lineHeight.lg};
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
    'data-tooltip-id'?: string;
    tabIndex?: number;
  }>;
  fieldDescription?: string | null;
  fieldLabel?: string | null;
};

export const shouldDisplayFieldDescriptionTooltip = (
  fieldLabel?: string | null,
  fieldDescription?: string | null,
) => isNonEmptyString(fieldLabel) && isNonEmptyString(fieldDescription);

export const FieldDescriptionTooltip = ({
  children,
  fieldDescription,
  fieldLabel,
}: FieldDescriptionTooltipProps) => {
  const fieldDescriptionTooltipAnchorId = useId();
  const fieldDescriptionId = `${fieldDescriptionTooltipAnchorId}-description`;

  if (!shouldDisplayFieldDescriptionTooltip(fieldLabel, fieldDescription)) {
    return children;
  }

  return (
    <>
      {cloneElement(children, {
        'aria-describedby': fieldDescriptionId,
        'data-tooltip-id': fieldDescriptionTooltipAnchorId,
        tabIndex: 0,
      })}
      <span id={fieldDescriptionId} hidden>
        {fieldDescription}
      </span>
      <AppTooltip
        anchorSelect={`[data-tooltip-id='${fieldDescriptionTooltipAnchorId}']`}
        delay={TooltipDelay.longDelay}
        isCompact
        noArrow
        place="bottom"
        positionStrategy="fixed"
        width="300px"
      >
        <StyledTooltipContent>
          <StyledFieldLabel aria-hidden>{fieldLabel}</StyledFieldLabel>
          <StyledFieldDescription>{fieldDescription}</StyledFieldDescription>
        </StyledTooltipContent>
      </AppTooltip>
    </>
  );
};
