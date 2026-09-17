import { FieldDescriptionTooltipContext } from '@/object-record/record-field/ui/contexts/FieldDescriptionTooltipContext';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode, useContext, useId } from 'react';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { isDefined } from 'twenty-shared/utils';

const StyledLabel = styled.span`
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type FieldDescriptionTooltipProps = {
  label?: string;
  description?: string | null;
  fallback?: ReactNode;
};

export const FieldDescriptionTooltip = ({
  label,
  description,
  fallback,
}: FieldDescriptionTooltipProps) => {
  const tooltipHandle = useContext(FieldDescriptionTooltipContext);
  const descriptionId = useId();

  if (
    !isDefined(tooltipHandle) ||
    !isNonEmptyString(label) ||
    !isNonEmptyString(description)
  ) {
    return fallback ?? <StyledLabel>{label}</StyledLabel>;
  }

  return (
    <>
      <Tooltip.Trigger
        handle={tooltipHandle}
        delay={TooltipDelay.longDelay}
        payload={{ title: label, description }}
        render={<StyledLabel />}
        aria-describedby={descriptionId}
        tabIndex={0}
      >
        {label}
      </Tooltip.Trigger>
      <span id={descriptionId} hidden>
        {description}
      </span>
    </>
  );
};
