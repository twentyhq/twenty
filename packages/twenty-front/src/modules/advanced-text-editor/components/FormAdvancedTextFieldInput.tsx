import { AdvancedTextEditor } from '@/advanced-text-editor/components/AdvancedTextEditor';
import { useAdvancedTextEditor } from '@/advanced-text-editor/hooks/useAdvancedTextEditor';
import { type AdvancedTextEditorComponentProps } from '@/advanced-text-editor/types/AdvancedTextEditorComponentProps';
import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { type UploadErrorHandler } from '@/advanced-text-editor/types/UploadErrorHandler';
import { type UploadedFile } from '@/advanced-text-editor/types/UploadedFile';
import { type UploadedImage } from '@/advanced-text-editor/types/UploadedImage';
import { serializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeAdvancedTextEditorDocument';
import { syncAdvancedTextEditorState } from '@/advanced-text-editor/utils/syncAdvancedTextEditorState';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { type VariablePickerComponent } from '@/ui/input/types/VariablePickerComponent';
import { useFullScreenModal } from '@/ui/layout/fullscreen/hooks/useFullScreenModal';
import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/types/BreadcrumbProps';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { useRemoveFocusItemFromFocusStackOnUnmount } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackOnUnmount';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isUndefined } from '@sniptt/guards';
import { type Editor } from '@tiptap/core';
import { type ComponentType, useCallback, useId, useState } from 'react';
import { flushSync } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconMaximize } from 'twenty-ui/icon';
import { Field } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledAdvancedTextFieldContainerWrapper = styled.div<{
  hasFieldChrome: boolean;
}>`
  display: flex;
  flex-direction: column;
  flex-grow: ${({ hasFieldChrome }) => (hasFieldChrome ? 0 : 1)};
  min-height: ${({ hasFieldChrome }) => (hasFieldChrome ? 'auto' : '0')};
`;

const documentChromeFieldInputContainerClassName = css`
  flex-grow: 1;
  min-height: 0;
`;

const StyledAdvancedTextFieldFieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: ${themeCssVariables.spacing[2]};
  position: relative;
`;

const StyledAdvancedTextFieldInnerContainer = styled.div<{
  hasFieldChrome: boolean;
}>`
  background-color: ${({ hasFieldChrome }) =>
    hasFieldChrome ? themeCssVariables.background.transparent.lighter : 'none'};
  border: ${({ hasFieldChrome }) =>
    hasFieldChrome
      ? `1px solid ${themeCssVariables.border.color.medium}`
      : 'none'};
  border-radius: ${({ hasFieldChrome }) =>
    hasFieldChrome ? themeCssVariables.border.radius.md : '0'};
  box-sizing: border-box;

  display: flex;
  flex-grow: 1;
  overflow: auto;
  width: 100%;
`;

const StyledEditorActionButtonContainer = styled.div<{
  hasVariablePicker?: boolean;
}>`
  margin-top: ${themeCssVariables.spacing[1]};
  position: absolute;
  right: ${({ hasVariablePicker }) =>
    hasVariablePicker
      ? `calc(${themeCssVariables.spacing[7]} + ${themeCssVariables.spacing[2]})`
      : themeCssVariables.spacing[1]};
  top: ${themeCssVariables.spacing[0]};
  z-index: 1;
`;

const StyledFullScreenEditorContainer = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]};
`;

type FormAdvancedTextFieldInputProps = {
  label?: string;
  error?: string;
  hint?: string;
  defaultValue?: string | null;
  value?: string | null;
  'aria-label'?: string;
  onChange?: (value: string) => void;
  readonly?: boolean;
  placeholder?: string;
  VariablePicker?: VariablePickerComponent;
  onImageUpload?: (file: File) => Promise<UploadedImage>;
  onImageUploadError?: UploadErrorHandler;
  onFileUpload?: (file: File) => Promise<UploadedFile>;
  onFileUploadError?: UploadErrorHandler;
  profile: AdvancedTextEditorProfile;
  EditorComponent?: ComponentType<AdvancedTextEditorComponentProps>;
  minHeight?: number;
  enableFullScreen?: boolean;
  fullScreenBreadcrumbs?: BreadcrumbProps['links'];
  onEditorReady?: (editor: Editor | null) => void;
};

export const FormAdvancedTextFieldInput = ({
  label,
  error,
  hint,
  defaultValue,
  value,
  'aria-label': ariaLabel,
  placeholder,
  onChange,
  readonly,
  VariablePicker,
  onImageUpload,
  onImageUploadError,
  onFileUpload,
  onFileUploadError,
  profile,
  EditorComponent = AdvancedTextEditor,
  minHeight,
  enableFullScreen,
  fullScreenBreadcrumbs,
  onEditorReady,
}: FormAdvancedTextFieldInputProps) => {
  const { chrome, variant, minHeight: profileMinHeight } = profile;

  const editorMinHeight = minHeight ?? profileMinHeight;
  const accessibleLabel = ariaLabel ?? label;
  const isFullScreenEnabled = enableFullScreen ?? profile.enableFullScreen;

  const instanceId = useId();
  const isMobile = useIsMobile();
  const [isFullScreen, setIsFullScreen] = useState(false);

  const { t } = useLingui();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();
  useRemoveFocusItemFromFocusStackOnUnmount({
    focusId: instanceId,
    isEnabled: true,
  });

  const editor = useAdvancedTextEditor({
    profile,
    placeholder: placeholder,
    readonly,
    defaultValue: isUndefined(value) ? defaultValue : value,
    editorProps: {
      attributes: {
        'aria-multiline': 'true',
        role: 'textbox',
        ...(isDefined(accessibleLabel)
          ? { 'aria-label': accessibleLabel }
          : {}),
      },
    },
    onUpdate: (editor) => {
      onChange?.(serializeAdvancedTextEditorDocument(editor));
    },
    onFocus: () => {
      pushFocusItemToFocusStack({
        focusId: instanceId,
        component: {
          type: FocusComponentType.FORM_FIELD_INPUT,
          instanceId: instanceId,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysConflictingWithKeyboard: false,
        },
      });
    },
    onBlur: () => {
      removeFocusItemFromFocusStackById({ focusId: instanceId });
    },
    onImageUpload,
    onImageUploadError,
    onFileUpload,
    onFileUploadError,
  });

  const handleFullScreenChange = (isFullScreenOpen: boolean) => {
    flushSync(() => {
      setIsFullScreen(isFullScreenOpen);
    });
    editor?.commands.focus();
  };

  const handleVariableTagInsert = (variableName: string) => {
    if (!isDefined(editor)) {
      throw new Error(
        doNotTranslate(
          'Expected the editor to be defined when a variable is selected',
        ),
      );
    }

    const focusedHtmlEditor = editor.storage.html?.focusedHtmlEditor;

    const variableTargetEditor =
      isDefined(focusedHtmlEditor) && !focusedHtmlEditor.isDestroyed
        ? focusedHtmlEditor
        : editor;

    variableTargetEditor.chain().focus().insertVariableTag(variableName).run();
  };

  const defaultBreadcrumbs: BreadcrumbProps['links'] = [
    {
      children: t`Text Editor`,
    },
  ];

  const breadcrumbLinks = fullScreenBreadcrumbs || defaultBreadcrumbs;

  const { renderFullScreenModal } = useFullScreenModal({
    links: breadcrumbLinks,
    onClose: () => handleFullScreenChange(false),
    hasClosePageButton: !isMobile,
  });

  const handleEditorReady = useCallback(
    (container: HTMLDivElement | null) => {
      onEditorReady?.(isDefined(container) ? editor : null);
    },
    [editor, onEditorReady],
  );

  const handleEditorContainerChange = useCallback(
    (container: HTMLDivElement | null) => {
      if (!isDefined(container) || !isDefined(editor)) {
        return;
      }

      syncAdvancedTextEditorState({
        editor,
        value,
        readonly,
        parseLegacyDocument: profile.parseLegacyDocument,
      });
    },
    [editor, value, readonly, profile.parseLegacyDocument],
  );

  if (!isDefined(editor)) {
    return null;
  }

  const fullScreenOverlay = isFullScreenEnabled
    ? renderFullScreenModal(
        <div data-globally-prevent-click-outside="true">
          <StyledFullScreenEditorContainer>
            <EditorComponent
              editor={editor}
              readonly={readonly}
              minHeight={editorMinHeight}
              variant={variant}
            />
          </StyledFullScreenEditorContainer>
        </div>,
        isFullScreen,
      )
    : null;

  return (
    <>
      <StyledAdvancedTextFieldContainerWrapper
        ref={handleEditorReady}
        hasFieldChrome={chrome === 'field'}
      >
        <FormFieldInputContainer
          className={
            chrome === 'field'
              ? undefined
              : documentChromeFieldInputContainerClassName
          }
        >
          {label ? <Field.Label>{label}</Field.Label> : null}

          <StyledAdvancedTextFieldFieldContainer>
            <StyledAdvancedTextFieldInnerContainer
              ref={handleEditorContainerChange}
              hasFieldChrome={chrome === 'field'}
            >
              {!isFullScreen && (
                <EditorComponent
                  editor={editor}
                  readonly={readonly}
                  minHeight={editorMinHeight}
                  variant={variant}
                />
              )}

              {isFullScreenEnabled && (
                <StyledEditorActionButtonContainer
                  hasVariablePicker={isDefined(VariablePicker) && !readonly}
                >
                  {!readonly && !isFullScreen && (
                    <LightIconButton
                      size="sm"
                      onClick={() => handleFullScreenChange(true)}
                      emphasis="subtle"
                      aria-label={t`Expand to full screen`}
                    >
                      <IconMaximize />
                    </LightIconButton>
                  )}
                </StyledEditorActionButtonContainer>
              )}

              {VariablePicker && !readonly ? (
                <VariablePicker
                  instanceId={instanceId}
                  multiline={true}
                  onVariableSelect={handleVariableTagInsert}
                />
              ) : null}
            </StyledAdvancedTextFieldInnerContainer>
          </StyledAdvancedTextFieldFieldContainer>
          {hint && <Field.Description>{hint}</Field.Description>}
          {error && <Field.Error match>{error}</Field.Error>}
        </FormFieldInputContainer>
      </StyledAdvancedTextFieldContainerWrapper>

      {fullScreenOverlay}
    </>
  );
};
