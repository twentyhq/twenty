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
import { useFullScreenModal } from '@/ui/layout/fullscreen/hooks/useFullScreenModal';
import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useId, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconMaximize } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledAdvancedTextFieldContainerWrapper = styled.div`
  flex-grow: 1;
`;

const StyledAdvancedTextFieldFieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: ${themeCssVariables.spacing[2]};
  position: relative;
`;

const StyledAdvancedTextFieldInnerContainer = styled.div`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
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
  border-radius: ${themeCssVariables.border.radius.sm};
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
      <StyledAdvancedTextFieldContainerWrapper>
        <FormFieldInputContainer>
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
          {error && <InputErrorHelper>{error}</InputErrorHelper>}
        </FormFieldInputContainer>
      </StyledAdvancedTextFieldContainerWrapper>

      {fullScreenOverlay}
    </>
  );
};
