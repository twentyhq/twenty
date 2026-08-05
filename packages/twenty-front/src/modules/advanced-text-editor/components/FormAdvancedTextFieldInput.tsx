import { AdvancedTextEditor } from '@/advanced-text-editor/components/AdvancedTextEditor';
import { useAdvancedTextEditor } from '@/advanced-text-editor/hooks/useAdvancedTextEditor';
import { type AdvancedTextEditorComponentProps } from '@/advanced-text-editor/types/AdvancedTextEditorComponentProps';
import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { type UploadedImage } from '@/advanced-text-editor/types/UploadedImage';
import { serializeAdvancedTextEditorContent } from '@/advanced-text-editor/utils/serializeAdvancedTextEditorContent';
import { InputHint } from '@/ui/input/components/InputHint';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { type VariablePickerComponent } from '@/ui/input/types/VariablePickerComponent';
import { useFullScreenModal } from '@/ui/layout/fullscreen/hooks/useFullScreenModal';
import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/core';
import { type ComponentType, useEffect, useId, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconMaximize } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledAdvancedTextFieldContainerWrapper = styled.div<{
  hasFieldChrome: boolean;
}>`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 0;

  /* Document editors stretch to their available height; field editors keep
     their intrinsic height so they compose naturally inside forms. */
  & > * {
    flex-grow: ${({ hasFieldChrome }) => (hasFieldChrome ? 0 : 1)};
    min-height: 0;
  }
`;

const StyledFormFieldInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
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
  defaultValue: string | undefined | null;
  onChange?: (value: string) => void;
  readonly?: boolean;
  placeholder?: string;
  VariablePicker?: VariablePickerComponent;
  onImageUpload?: (file: File) => Promise<UploadedImage>;
  onImageUploadError?: (error: Error, file: File) => void;
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
  placeholder,
  onChange,
  readonly,
  VariablePicker,
  onImageUpload,
  onImageUploadError,
  profile,
  EditorComponent = AdvancedTextEditor,
  minHeight,
  enableFullScreen,
  fullScreenBreadcrumbs,
  onEditorReady,
}: FormAdvancedTextFieldInputProps) => {
  const { contentType, chrome, minHeight: profileMinHeight } = profile;

  const editorMinHeight = minHeight ?? profileMinHeight;
  const isFullScreenEnabled = enableFullScreen ?? profile.enableFullScreen;

  const instanceId = useId();
  const isMobile = useIsMobile();
  const [isFullScreen, setIsFullScreen] = useState(false);

  const { t } = useLingui();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const editor = useAdvancedTextEditor(
    {
      profile,
      placeholder: placeholder,
      readonly,
      defaultValue,
      onUpdate: (editor) => {
        onChange?.(serializeAdvancedTextEditorContent({ editor, contentType }));
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
    },
    [isFullScreen],
  );

  useEffect(() => {
    onEditorReady?.(editor);

    return () => {
      onEditorReady?.(null);
    };
  }, [editor, onEditorReady]);

  const handleEnterFullScreen = () => {
    setIsFullScreen(true);
  };

  const handleExitFullScreen = () => {
    setIsFullScreen(false);
  };

  const handleVariableTagInsert = (variableName: string) => {
    if (!isDefined(editor)) {
      throw new Error(
        'Expected the editor to be defined when a variable is selected',
      );
    }

    editor.commands.insertVariableTag(variableName);
  };

  const defaultBreadcrumbs: BreadcrumbProps['links'] = [
    {
      children: t`Text Editor`,
    },
  ];

  const breadcrumbLinks = fullScreenBreadcrumbs || defaultBreadcrumbs;

  const { renderFullScreenModal } = useFullScreenModal({
    links: breadcrumbLinks,
    onClose: handleExitFullScreen,
    hasClosePageButton: !isMobile,
  });

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
            />
          </StyledFullScreenEditorContainer>
        </div>,
        isFullScreen,
      )
    : null;

  return (
    <>
      <StyledAdvancedTextFieldContainerWrapper
        hasFieldChrome={chrome === 'field'}
      >
        <StyledFormFieldInputContainer>
          {label ? <InputLabel>{label}</InputLabel> : null}

          <StyledAdvancedTextFieldFieldContainer>
            <StyledAdvancedTextFieldInnerContainer
              hasFieldChrome={chrome === 'field'}
            >
              {!isFullScreen && (
                <EditorComponent
                  editor={editor}
                  readonly={readonly}
                  minHeight={editorMinHeight}
                />
              )}

              {isFullScreenEnabled && (
                <StyledEditorActionButtonContainer
                  hasVariablePicker={isDefined(VariablePicker) && !readonly}
                >
                  {!readonly && !isFullScreen && (
                    <LightIconButton
                      Icon={IconMaximize}
                      size="small"
                      onClick={handleEnterFullScreen}
                      accent="tertiary"
                    />
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
          {hint && <InputHint>{hint}</InputHint>}
          {error && <InputHint danger>{error}</InputHint>}
        </StyledFormFieldInputContainer>
      </StyledAdvancedTextFieldContainerWrapper>

      {fullScreenOverlay}
    </>
  );
};
