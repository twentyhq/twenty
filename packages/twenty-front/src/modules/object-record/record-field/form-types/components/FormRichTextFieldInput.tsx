import { BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import { FormFieldInputInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputInputContainer';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { BlockEditor } from '@/ui/input/editor/components/BlockEditor';
import { initializeEditorContent } from '@/workflow/workflow-variables/utils/initializeEditorContent';
import { VariableTag } from '@/workflow/workflow-variables/utils/variableTag';
import { PartialBlock } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import styled from '@emotion/styled';

import { useRef } from 'react';

const StyledContainer = styled.div`
  position: relative;
`;

const StyledRichTextContainer = styled.div`
  height: 400px;
  width: 500px;

  overflow: auto;

  .variable-tag {
    background-color: ${({ theme }) => theme.color.blue10};
    border-radius: ${({ theme }) => theme.border.radius.sm};
    color: ${({ theme }) => theme.color.blue};
    padding: ${({ theme }) => theme.spacing(1)};
  }
`;

type FormRichTextFieldInputProps = {
  label?: string;
  defaultValue: string | undefined;
  onPersist: (value: string | null) => void;
  VariablePicker?: VariablePickerComponent;
};

export const FormRichTextFieldInput = ({
  label,
  defaultValue,
  onPersist,
  VariablePicker,
}: FormRichTextFieldInputProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const persistRichTextField = (nextValue: PartialBlock[]) => {
    if (!nextValue) {
      onPersist(null);
    } else {
      const parsedValueToPersist = JSON.stringify(nextValue);

      onPersist(parsedValueToPersist);
    }
  };

  const editor = useCreateBlockNote({
    domAttributes: { editor: { class: 'editor' } },
    schema: BLOCK_SCHEMA,
    _tiptapOptions: {
      onCreate: ({ editor }) => {
        initializeEditorContent(editor, 'lol {{test}} ptdr');
      },
      extensions: [VariableTag],
      onUpdate: () => {
        console.log('editor', editor.document);
      },
    },
  });

  const handleVariableTagInsert = (variable: string) => {
    editor._tiptapEditor.commands.insertContent({
      type: 'variableTag',
      attrs: { variable: variable },
    });
  };

  return (
    <StyledContainer>
      <FormFieldInputInputContainer hasRightElement={false}>
        <StyledRichTextContainer ref={containerRef}>
          <BlockEditor editor={editor} />
        </StyledRichTextContainer>
      </FormFieldInputInputContainer>

      {VariablePicker ? (
        <VariablePicker
          inputId={'lolol'}
          multiline
          onVariableSelect={handleVariableTagInsert}
        />
      ) : null}
    </StyledContainer>
  );
};
