import { AdvancedTextEditor } from '@/advanced-text-editor/components/AdvancedTextEditor';
import { type AdvancedTextEditorComponentProps } from '@/advanced-text-editor/types/AdvancedTextEditorComponentProps';
import { styled } from '@linaria/react';
import { useEditorState } from '@tiptap/react';
import { isDefined, resolveCanvasTheme } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCanvasBackdrop = styled.div`
  box-sizing: border-box;
  flex-grow: 1;
  min-height: 100%;
  padding: ${themeCssVariables.spacing[8]} ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledCanvasPage = styled.div`
  box-sizing: border-box;
  margin: 0 auto;
  max-width: 100%;
  min-height: 400px;

  .editor-content,
  .tiptap {
    min-height: inherit;
  }

  .tiptap {
    color: inherit;
    padding: 0;
  }
`;

type EmailEditorCanvasProps = AdvancedTextEditorComponentProps;

export const EmailEditorCanvas = ({
  editor,
  readonly,
  minHeight,
}: EmailEditorCanvasProps) => {
  const canvasTheme = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) =>
      resolveCanvasTheme(currentEditor.state.doc.attrs.canvasTheme),
  });

  if (!isDefined(canvasTheme)) {
    return (
      <AdvancedTextEditor
        editor={editor}
        readonly={readonly}
        minHeight={minHeight}
      />
    );
  }

  return (
    <StyledCanvasBackdrop
      style={{
        backgroundColor: canvasTheme.pageBackground,
        padding: canvasTheme.pagePadding,
      }}
    >
      <StyledCanvasPage
        style={{
          backgroundColor: canvasTheme.bodyBackground || undefined,
          border:
            canvasTheme.borderWidth !== '' && canvasTheme.borderWidth !== '0px'
              ? `${canvasTheme.borderWidth} solid ${canvasTheme.borderColor}`
              : undefined,
          borderRadius: canvasTheme.cornerRadius,
          color: canvasTheme.textColor,
          padding: canvasTheme.padding,
          textAlign: canvasTheme.textAlign,
          width: canvasTheme.width,
        }}
      >
        <AdvancedTextEditor
          editor={editor}
          readonly={readonly}
          minHeight={minHeight}
        />
      </StyledCanvasPage>
    </StyledCanvasBackdrop>
  );
};
