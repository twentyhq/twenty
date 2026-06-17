import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { useOpenFieldWidgetFieldInputEditMode } from '@/page-layout/widgets/field/hooks/useOpenFieldWidgetFieldInputEditMode';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { styled } from '@linaria/react';
import { IconPencil } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledEditButtonWrapper = styled.div<{ isMobile: boolean }>`
  opacity: ${({ isMobile }) => (isMobile ? '1' : '0')};
  pointer-events: none;
  transition: opacity ${themeCssVariables.animation.duration.instant}s ease;

  .widget:hover & {
    opacity: 1;
    pointer-events: auto;
  }
`;

export const FieldWidgetEditAction = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);
  const { openInlineCell } = useInlineCell();
  const { openFieldInput } = useOpenFieldWidgetFieldInputEditMode();
  const isMobile = useIsMobile();

  const handleClick = () => {
    openInlineCell();
    openFieldInput({
      fieldDefinition,
      recordId,
    });
  };

  return (
    <StyledEditButtonWrapper isMobile={isMobile}>
      <LightIconButton
        Icon={IconPencil}
        accent="secondary"
        onClick={handleClick}
      />
    </StyledEditButtonWrapper>
  );
};
