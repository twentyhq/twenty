import { BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useRichTextDeprecatedField } from '@/object-record/record-field/meta-types/hooks/useRichTextDeprecatedField';
import { FieldInputClickOutsideEvent } from '@/object-record/record-field/meta-types/input/components/DateTimeFieldInput';
import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';
import { BlockEditor } from '@/ui/input/editor/components/BlockEditor';
import { BlockEditorComponentInstanceContext } from '@/ui/input/editor/contexts/BlockEditorCompoponeInstanceContext';
import { PartialBlock } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import styled from '@emotion/styled';

import { useContext, useRef } from 'react';

const StyledRichTextDeprecatedContainer = styled.div`
  height: 400px;
  width: 500px;

  overflow: auto;
`;

export type RichTextDeprecatedFieldInputProps = {
  onClickOutside?: FieldInputClickOutsideEvent;
};

export const RichTextDeprecatedFieldInput = ({
  onClickOutside,
}: RichTextDeprecatedFieldInputProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { recordId } = useContext(FieldContext);
  const {
    draftValue,
    hotkeyScope,
    persistRichTextDeprecatedField,
    fieldDefinition,
  } = useRichTextDeprecatedField();

  const editor = useCreateBlockNote({
    initialContent: draftValue,
    domAttributes: { editor: { class: 'editor' } },
    schema: BLOCK_SCHEMA,
  });

  const handleClickOutside = (event: MouseEvent | TouchEvent) => {
    onClickOutside?.(
      () => persistRichTextDeprecatedField(editor.document),
      event,
    );
  };

  useRegisterInputEvents<PartialBlock[]>({
    inputRef: containerRef,
    inputValue: draftValue,
    onClickOutside: handleClickOutside,
    hotkeyScope,
  });

  return (
    <StyledRichTextDeprecatedContainer ref={containerRef}>
      <BlockEditorComponentInstanceContext.Provider
        value={{ instanceId: `${recordId}-${fieldDefinition.fieldMetadataId}` }}
      >
        <BlockEditor editor={editor} />
      </BlockEditorComponentInstanceContext.Provider>
    </StyledRichTextDeprecatedContainer>
  );
};
