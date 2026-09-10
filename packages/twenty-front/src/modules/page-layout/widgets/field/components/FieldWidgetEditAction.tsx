import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { useOpenFieldWidgetFieldInputEditMode } from '@/page-layout/widgets/field/hooks/useOpenFieldWidgetFieldInputEditMode';
import { WidgetCardHeaderHoverReveal } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderHoverReveal';
import { IconPencil } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';

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
    <WidgetCardHeaderHoverReveal>
      <LightIconButton
        Icon={IconPencil}
        accent="secondary"
        onClick={handleClick}
      />
    </WidgetCardHeaderHoverReveal>
  );
};
