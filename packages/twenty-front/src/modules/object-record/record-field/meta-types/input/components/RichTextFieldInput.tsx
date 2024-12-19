import { BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import { useRichTextField } from '@/object-record/record-field/meta-types/hooks/useRichTextField';
import { FieldInputClickOutsideEvent } from '@/object-record/record-field/meta-types/input/components/DateTimeFieldInput';
import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';
import { BlockEditor } from '@/ui/input/editor/components/BlockEditor';
import { PartialBlock } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import styled from '@emotion/styled';

import { useRef } from 'react';

const StyledRichTextContainer = styled.div`
  height: 400px;
  width: 500px;

  overflow: auto;
`;

export type RichTextFieldInputProps = {
  onClickOutside?: FieldInputClickOutsideEvent;
};

export const RichTextFieldInput = ({
  onClickOutside,
}: RichTextFieldInputProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { draftValue, hotkeyScope, persistRichTextField } = useRichTextField();

  const editor = useCreateBlockNote({
    initialContent: draftValue,
    domAttributes: { editor: { class: 'editor' } },
    schema: BLOCK_SCHEMA,
  });

  // const { refs, floatingStyles } = useFloating({
  //   placement: 'bottom',
  //   middleware: [
  //     flip(),
  //     size({
  //       padding: 32,
  //       apply: ({ availableHeight, elements }) => {
  //         elements.floating.style.maxHeight =
  //           availableHeight >= elements.floating.scrollHeight
  //             ? ''
  //             : `${availableHeight}px`;

  //         elements.floating.style.height = 'auto';
  //       },
  //       boundary: document.querySelector('#root') ?? undefined,
  //     }),
  //     offset({
  //       crossAxis: -6,
  //       mainAxis: 8,
  //     }),
  //   ],
  //   whileElementsMounted: autoUpdate,
  //   strategy: 'absolute',
  // });

  const handleClickOutside = (event: MouseEvent | TouchEvent) => {
    onClickOutside?.(() => persistRichTextField(editor.document), event);
  };

  useRegisterInputEvents<PartialBlock[]>({
    inputRef: containerRef,
    inputValue: draftValue,
    onClickOutside: handleClickOutside,
    hotkeyScope,
  });

  return (
    <StyledRichTextContainer ref={containerRef}>
      <BlockEditor editor={editor} />
    </StyledRichTextContainer>
  );
};
