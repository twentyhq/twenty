import { AdvancedTextEditor } from '@/advanced-text-editor/components/AdvancedTextEditor';
import { AdvancedTextEditorBlockHandle } from '@/advanced-text-editor/components/AdvancedTextEditorBlockHandle';
import { EmailEditorHtmlBlockSettingsEffect } from '@/activities/emails/editor/components/EmailEditorHtmlBlockSettingsEffect';
import { useOpenEmailBlockStyleInSidePanel } from '@/side-panel/hooks/useOpenEmailBlockStyleInSidePanel';
import { themeBoxValueToSides } from '@/side-panel/pages/email-block-settings/utils/themeBoxValueToSides';
import { useLiveEditorState } from '@/advanced-text-editor/hooks/useLiveEditorState';
import { type AdvancedTextEditorComponentProps } from '@/advanced-text-editor/types/AdvancedTextEditorComponentProps';
import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';
import { CANVAS_THEME_DEFAULTS, resolveCanvasTheme } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledCanvasBackdrop = styled.div`
  box-sizing: border-box;
  flex-grow: 1;
  min-height: 100%;
  padding: ${themeCssVariables.spacing[8]} ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledCanvasPage = styled.div`
  box-sizing: border-box;
  display: grid;
  margin: 0 auto;
  max-width: 100%;
  min-height: 400px;

  .editor-content,
  .tiptap {
    min-height: inherit;
  }

  .tiptap {
    color: inherit;
    margin-left: calc(-1 * ${themeCssVariables.spacing[10]});
    padding: 0 0 0 ${themeCssVariables.spacing[10]};
    padding-bottom: var(--email-canvas-padding-bottom, 0);
    width: calc(100% + ${themeCssVariables.spacing[10]});
  }
`;

type EmailEditorCanvasProps = AdvancedTextEditorComponentProps;

export const EmailEditorCanvas = ({
  editor,
  readonly,
  minHeight,
  variant,
}: EmailEditorCanvasProps) => {
  const storedCanvasTheme = useLiveEditorState(editor, (currentEditor) =>
    resolveCanvasTheme(currentEditor.state.doc.attrs.canvasTheme),
  );
  const canvasTheme = storedCanvasTheme ?? CANVAS_THEME_DEFAULTS;
  const canvasPadding = themeBoxValueToSides(canvasTheme.padding);
  const { openEmailBlockStyleInSidePanel } =
    useOpenEmailBlockStyleInSidePanel();

  return (
    <StyledCanvasBackdrop
      style={{
        backgroundColor: canvasTheme.pageBackground,
        padding: canvasTheme.pagePadding,
      }}
    >
      <StyledCanvasPage
        style={
          {
            backgroundColor: canvasTheme.bodyBackground || undefined,
            border:
              canvasTheme.borderWidth !== '' &&
              canvasTheme.borderWidth !== '0px'
                ? `${canvasTheme.borderWidth} solid ${canvasTheme.borderColor}`
                : undefined,
            borderRadius: canvasTheme.cornerRadius,
            color: canvasTheme.textColor,
            padding: `${canvasPadding.top} ${canvasPadding.right} 0 ${canvasPadding.left}`,
            textAlign: canvasTheme.textAlign,
            width: canvasTheme.width,
            '--email-canvas-padding-bottom': canvasPadding.bottom,
          } as CSSProperties
        }
      >
        <AdvancedTextEditor
          editor={editor}
          readonly={readonly}
          minHeight={minHeight}
          variant={variant}
        />
        <AdvancedTextEditorBlockHandle
          editor={editor}
          onOpenBlockSettings={openEmailBlockStyleInSidePanel}
        />
        {!readonly && <EmailEditorHtmlBlockSettingsEffect editor={editor} />}
      </StyledCanvasPage>
    </StyledCanvasBackdrop>
  );
};
