import { AdvancedTextEditorDragPreview } from '@/advanced-text-editor/components/AdvancedTextEditorDragPreview';
import { ADVANCED_TEXT_EDITOR_EXTERNAL_DRAG_MIME_TYPE } from '@/advanced-text-editor/constants/AdvancedTextEditorExternalDragMimeType';
import { type Editor, type JSONContent } from '@tiptap/core';
import { Fragment, Slice } from '@tiptap/pm/model';
import { type DragEvent, type ReactNode, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';

type AdvancedTextEditorDraggableContentProps = {
  editor: Editor;
  content: JSONContent;
  Icon: IconComponent;
  label: string;
  children: ReactNode;
};

export const AdvancedTextEditorDraggableContent = ({
  editor,
  content,
  Icon,
  label,
  children,
}: AdvancedTextEditorDraggableContentProps) => {
  const dragPreviewRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData(
      ADVANCED_TEXT_EDITOR_EXTERNAL_DRAG_MIME_TYPE,
      '',
    );
    event.dataTransfer.effectAllowed = 'copy';

    if (isDefined(dragPreviewRef.current)) {
      event.dataTransfer.setDragImage(
        dragPreviewRef.current,
        0,
        dragPreviewRef.current.offsetHeight / 2,
      );
    }

    editor.view.dragging = {
      slice: new Slice(
        Fragment.from(editor.schema.nodeFromJSON(content)),
        0,
        0,
      ),
      move: false,
    };
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => {
        editor.view.dragging = null;
      }}
    >
      {children}
      <AdvancedTextEditorDragPreview
        ref={dragPreviewRef}
        isInsertion
        Icon={Icon}
        label={label}
      />
    </div>
  );
};
