import { FieldDescriptionTooltipContext } from '@/object-record/record-field/ui/contexts/FieldDescriptionTooltipContext';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode, useContext, useId } from 'react';
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
  const context = useContext(FieldDescriptionTooltipContext);
  const descriptionId = useId();

  if (
    !isDefined(context) ||
    !isNonEmptyString(label) ||
    !isNonEmptyString(description)
  ) {
    return fallback ?? <StyledLabel>{label}</StyledLabel>;
  }

  const handleEnter = () => {
    context.setTooltipContent({ title: label, description });
  };

  return (
    <>
      <StyledLabel
        data-tooltip-id={context.tooltipId}
        aria-describedby={descriptionId}
        tabIndex={0}
        onMouseEnter={handleEnter}
        onFocus={handleEnter}
      >
        {label}
      </StyledLabel>
      <span id={descriptionId} hidden>
        {description}
      </span>
    </>
  );
};
