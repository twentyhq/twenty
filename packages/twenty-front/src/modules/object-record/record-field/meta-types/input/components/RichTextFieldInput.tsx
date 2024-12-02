import { BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import { useRichTextField } from '@/object-record/record-field/meta-types/hooks/useRichTextField';
import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { BlockEditor } from '@/ui/input/editor/components/BlockEditor';
import { getFirstNonEmptyLineOfRichText } from '@/ui/input/editor/utils/getFirstNonEmptyLineOfRichText';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { PartialBlock } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import styled from '@emotion/styled';

import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  size,
  useFloating,
} from '@floating-ui/react';
import { useRef } from 'react';

const StyledRichTextDropdownMenu = styled(DropdownMenu)`
  overflow: scroll;
`;

export type RichTextFieldInputProps = {
  onClickOutside?: FieldInputEvent;
};

export const RichTextFieldInput = ({
  onClickOutside,
}: RichTextFieldInputProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { draftValue, hotkeyScope, persistRichTextField } = useRichTextField();

  const firstLine = getFirstNonEmptyLineOfRichText(draftValue);

  const editor = useCreateBlockNote({
    initialContent: draftValue,
    domAttributes: { editor: { class: 'editor' } },
    schema: BLOCK_SCHEMA,
  });

  const { refs, floatingStyles } = useFloating({
    placement: 'bottom',
    middleware: [
      flip(),
      size({
        padding: 32,
        apply: ({ availableHeight, elements }) => {
          elements.floating.style.maxHeight =
            availableHeight >= elements.floating.scrollHeight
              ? ''
              : `${availableHeight}px`;

          elements.floating.style.height = 'auto';
        },
        boundary: document.querySelector('#root') ?? undefined,
      }),
      offset({
        crossAxis: -6,
        mainAxis: 8,
      }),
    ],
    whileElementsMounted: autoUpdate,
    strategy: 'absolute',
  });

  const handleClickOutside = () => {
    onClickOutside?.(() => persistRichTextField(editor.document));
  };

  useRegisterInputEvents<PartialBlock[]>({
    inputRef: containerRef,
    copyRef: refs.floating,
    inputValue: draftValue,
    onClickOutside: handleClickOutside,
    hotkeyScope,
  });

  return (
    <div ref={containerRef}>
      <div
        ref={refs.setReference}
        style={{ width: '100%', height: '100%', padding: 6 }}
      >
        {firstLine}
      </div>
      <FloatingPortal>
        <StyledRichTextDropdownMenu
          width={500}
          data-select-disable
          ref={refs.setFloating}
          style={floatingStyles}
        >
          <BlockEditor editor={editor} />
        </StyledRichTextDropdownMenu>
      </FloatingPortal>
    </div>
  );
};
