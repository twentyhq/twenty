import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { useOpenFieldWidgetFieldInputEditMode } from '@/page-layout/widgets/field/hooks/useOpenFieldWidgetFieldInputEditMode';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { IconPencil } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

const StyledEditButton = styled(LightIconButton)<{ isMobile: boolean }>`
  ${({ theme, isMobile }) => css`
    opacity: ${isMobile ? 1 : 0};
    pointer-events: none;
    transition: opacity ${theme.animation.duration.instant}s ease;
  `}

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
    <StyledEditButton
      Icon={IconPencil}
      accent="secondary"
      onClick={handleClick}
      isMobile={isMobile}
    />
  );
};
