import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { useOpenFieldWidgetFieldInputEditMode } from '@/page-layout/widgets/field/hooks/useOpenFieldWidgetFieldInputEditMode';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { IconPencil } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

const StyledEditButton = styled(LightIconButton)`
  ${({ theme }) => css`
    opacity: 0;
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
    />
  );
};
