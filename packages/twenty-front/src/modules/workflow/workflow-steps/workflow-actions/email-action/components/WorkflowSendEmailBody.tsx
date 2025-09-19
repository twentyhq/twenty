import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
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
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { type WorkflowSendEmailAction } from '@/workflow/types/Workflow';
import { WorkflowEmailEditor } from '@/workflow/workflow-steps/workflow-actions/email-action/components/WorkflowEmailEditor';
import { useEmailEditor } from '@/workflow/workflow-steps/workflow-actions/email-action/hooks/useEmailEditor';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useId, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconMaximize } from 'twenty-ui/display';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledWorkflowSendEmailBodyContainer = styled(FormFieldInputContainer)`
  flex-grow: 1;
`;

const StyledWorkflowSendEmailFieldContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  flex-grow: 1;
`;

const StyledWorkflowSendEmailBodyInnerContainer = styled.div`
  flex-grow: 1;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};

  box-sizing: border-box;
  display: flex;
  overflow: auto;
  width: 100%;
`;

const StyledEmailEditorActionButtonContainer = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing(0)};
  right: ${({ theme }) => theme.spacing(7.5)};
  z-index: 1;
`;

const StyledFullScreenEmailEditorContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  flex: 1;
  min-height: 0;
  padding: ${({ theme }) => theme.spacing(2)};
  overflow-y: auto;
`;

const StyledFullScreenButtonContainer = styled(StyledDropdownButtonContainer)`
  background-color: 'transparent';

  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(2)};
  :hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.background.transparent.light};
  }
`;

type WorkflowSendEmailBodyProps = {
  action: WorkflowSendEmailAction;
  label?: string;
  error?: string;
  hint?: string;
  defaultValue: string | undefined | null;
  onChange: (value: string) => void;
  readonly?: boolean;
  placeholder?: string;
  VariablePicker?: VariablePickerComponent;
};

export const WorkflowSendEmailBody = ({
  action,
  label,
  error,
  hint,
  defaultValue,
  placeholder,
  onChange,
  readonly,
  VariablePicker,
}: WorkflowSendEmailBodyProps) => {
  const instanceId = useId();
  const isMobile = useIsMobile();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const theme = useTheme();

  const { uploadAttachmentFile } = useUploadAttachmentFile();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();
  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflow = useWorkflowWithCurrentVersion(workflowVisualizerWorkflowId);

  const headerTitle = isDefined(action.name) ? action.name : 'Send Email';

  const handleUploadAttachment = async (file: File) => {
    if (!isDefined(workflowVisualizerWorkflowId)) {
      return undefined;
    }

    const { attachmentAbsoluteURL } = await uploadAttachmentFile(file, {
      id: workflowVisualizerWorkflowId,
      targetObjectNameSingular: CoreObjectNameSingular.Workflow,
    });

    return attachmentAbsoluteURL;
  };

  const editor = useEmailEditor(
    {
      placeholder: placeholder ?? 'Enter email',
      readonly,
      defaultValue,
      onUpdate: (editor) => {
        const jsonContent = editor.getJSON();
        onChange(JSON.stringify(jsonContent));
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
      onImageUpload: handleUploadAttachment,
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

  const breadcrumbLinks: BreadcrumbProps['links'] = [
    {
      children: workflow?.name?.trim() || t`Untitled Workflow`,
      href: '#',
    },
    {
      children: headerTitle,
      href: '#',
    },
    {
      children: t`Email Editor`,
    },
  ];

  const { renderFullScreenModal } = useFullScreenModal({
    links: breadcrumbLinks,
    onClose: handleExitFullScreen,
    hasClosePageButton: !isMobile,
  });

  const fullScreenOverlay = renderFullScreenModal(
    <div data-globally-prevent-click-outside="true">
      <StyledFullScreenEmailEditorContainer>
        <WorkflowEmailEditor editor={editor} readonly={readonly} />
      </StyledFullScreenEmailEditorContainer>
    </div>,
    isFullScreen,
  );

  if (!isDefined(editor)) {
    return null;
  }

  return (
    <>
      <StyledWorkflowSendEmailBodyContainer>
        {label ? <InputLabel>{label}</InputLabel> : null}

        <StyledWorkflowSendEmailFieldContainer>
          <StyledWorkflowSendEmailBodyInnerContainer>
            {!isFullScreen && (
              <WorkflowEmailEditor editor={editor} readonly={readonly} />
            )}

            <StyledEmailEditorActionButtonContainer>
              {!readonly && !isFullScreen && (
                <StyledFullScreenButtonContainer
                  isUnfolded={false}
                  transparentBackground
                  onClick={handleEnterFullScreen}
                >
                  <IconMaximize size={theme.icon.size.md} />
                </StyledFullScreenButtonContainer>
              )}
            </StyledEmailEditorActionButtonContainer>

            {VariablePicker && !readonly ? (
              <VariablePicker
                instanceId={instanceId}
                multiline={true}
                onVariableSelect={handleVariableTagInsert}
              />
            ) : null}
          </StyledWorkflowSendEmailBodyInnerContainer>
        </StyledWorkflowSendEmailFieldContainer>
        {hint && <InputHint>{hint}</InputHint>}
        {error && <InputErrorHelper>{error}</InputErrorHelper>}
      </StyledWorkflowSendEmailBodyContainer>

      {fullScreenOverlay}
    </>
  );
};
