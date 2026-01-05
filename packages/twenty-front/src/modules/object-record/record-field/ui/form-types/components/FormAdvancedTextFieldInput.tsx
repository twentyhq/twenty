import { AdvancedTextEditor } from '@/advanced-text-editor/components/AdvancedTextEditor';
import {
  type AdvancedTextEditorContentType,
  useAdvancedTextEditor,
} from '@/advanced-text-editor/hooks/useAdvancedTextEditor';
import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { InputErrorHelper } from '@/ui/input/components/InputErrorHelper';
import { InputHint } from '@/ui/input/components/InputHint';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { StyledDropdownButtonContainer } from '@/ui/layout/dropdown/components/StyledDropdownButtonContainer';
import { useFullScreenModal } from '@/ui/layout/fullscreen/hooks/useFullScreenModal';
import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useId, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconMaximize } from 'twenty-ui/display';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledAdvancedTextFieldContainer = styled(FormFieldInputContainer)`
  flex-grow: 1;
`;

const StyledAdvancedTextFieldFieldContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  flex-grow: 1;
`;

const StyledAdvancedTextFieldInnerContainer = styled.div`
  flex-grow: 1;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};

  box-sizing: border-box;
  display: flex;
  overflow: auto;
  width: 100%;
`;

const StyledEditorActionButtonContainer = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing(0)};
  right: ${({ theme }) => theme.spacing(7.5)};
  z-index: 1;
`;

const StyledFullScreenEditorContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  flex: 1;
  min-height: 0;
  padding: ${({ theme }) => theme.spacing(2)};
  overflow-y: auto;
`;

const StyledFullScreenButtonContainer = styled(StyledDropdownButtonContainer)`
  background-color: transparent;

  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(2)};
  :hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.background.transparent.light};
  }
`;

type FormAdvancedTextFieldInputProps = {
  label?: string;
  error?: string;
  hint?: string;
  defaultValue: string | undefined | null;
  onChange: (value: string) => void;
  readonly?: boolean;
  placeholder?: string;
  VariablePicker?: VariablePickerComponent;
  onImageUpload?: (file: File) => Promise<string>;
  onImageUploadError?: (error: Error, file: File) => void;
  enableFullScreen?: boolean;
  fullScreenBreadcrumbs?: BreadcrumbProps['links'];
  minHeight: number;
  maxWidth: number;
  contentType?: AdvancedTextEditorContentType;
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
  enableFullScreen = true,
  fullScreenBreadcrumbs,
  minHeight,
  maxWidth,
  contentType = 'json',
}: FormAdvancedTextFieldInputProps) => {
  const instanceId = useId();
  const isMobile = useIsMobile();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const theme = useTheme();

  const { t } = useLingui();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const editor = useAdvancedTextEditor(
    {
      placeholder: placeholder,
      readonly,
      defaultValue,
      contentType,
      onUpdate: (editor) => {
        if (contentType === 'markdown') {
          // For markdown mode, output the HTML which preserves formatting
          onChange(editor.getHTML());
        } else {
          const jsonContent = editor.getJSON();
          onChange(JSON.stringify(jsonContent));
        }
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
      enableSlashCommand: true,
    },
    [isFullScreen],
  );

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

  const fullScreenOverlay = enableFullScreen
    ? renderFullScreenModal(
        <div data-globally-prevent-click-outside="true">
          <StyledFullScreenEditorContainer>
            <AdvancedTextEditor
              editor={editor}
              readonly={readonly}
              minHeight={minHeight}
              maxWidth={maxWidth}
            />
          </StyledFullScreenEditorContainer>
        </div>,
        isFullScreen,
      )
    : null;

  if (!isDefined(editor)) {
    return null;
  }

  return (
    <>
      <StyledAdvancedTextFieldContainer>
        {label ? <InputLabel>{label}</InputLabel> : null}

        <StyledAdvancedTextFieldFieldContainer>
          <StyledAdvancedTextFieldInnerContainer>
            {!isFullScreen && (
              <AdvancedTextEditor
                editor={editor}
                readonly={readonly}
                minHeight={minHeight}
                maxWidth={maxWidth}
              />
            )}

            {enableFullScreen && (
              <StyledEditorActionButtonContainer>
                {!readonly && !isFullScreen && (
                  <StyledFullScreenButtonContainer
                    isUnfolded={false}
                    transparentBackground
                    onClick={handleEnterFullScreen}
                  >
                    <IconMaximize size={theme.icon.size.md} />
                  </StyledFullScreenButtonContainer>
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
        {error && <InputErrorHelper>{error}</InputErrorHelper>}
      </StyledAdvancedTextFieldContainer>

      {fullScreenOverlay}
    </>
  );
};
