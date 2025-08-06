import { useGetAvailablePackages } from '@/settings/serverless-functions/hooks/useGetAvailablePackages';
import { useServerlessFunctionUpdateFormState } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { useUpdateOneServerlessFunction } from '@/settings/serverless-functions/hooks/useUpdateOneServerlessFunction';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { PAGE_BAR_MIN_HEIGHT } from '@/ui/layout/page/constants/PageBarMinHeight';
import {
  Breadcrumb,
  BreadcrumbProps,
} from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { WorkflowCodeAction } from '@/workflow/types/Workflow';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { setNestedValue } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/setNestedValue';

import { CmdEnterActionButton } from '@/action-menu/components/CmdEnterActionButton';
import { ServerlessFunctionExecutionResult } from '@/serverless-functions/components/ServerlessFunctionExecutionResult';
import { INDEX_FILE_PATH } from '@/serverless-functions/constants/IndexFilePath';
import { useTestServerlessFunction } from '@/serverless-functions/hooks/useTestServerlessFunction';
import { getFunctionInputFromSourceCode } from '@/serverless-functions/utils/getFunctionInputFromSourceCode';
import { getFunctionOutputSchema } from '@/serverless-functions/utils/getFunctionOutputSchema';
import { mergeDefaultFunctionInputAndFunctionInput } from '@/serverless-functions/utils/mergeDefaultFunctionInputAndFunctionInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { TextArea } from '@/ui/input/components/TextArea';
import { RightDrawerFooter } from '@/ui/layout/right-drawer/components/RightDrawerFooter';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { serverlessFunctionTestDataFamilyState } from '@/workflow/states/serverlessFunctionTestDataFamilyState';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowEditActionServerlessFunctionFields } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowEditActionServerlessFunctionFields';
import { WorkflowServerlessFunctionCodeEditor } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowServerlessFunctionCodeEditor';
import { WORKFLOW_SERVERLESS_FUNCTION_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/workflow-actions/code-action/constants/WorkflowServerlessFunctionTabListComponentId';
import { WorkflowServerlessFunctionTabId } from '@/workflow/workflow-steps/workflow-actions/code-action/types/WorkflowServerlessFunctionTabId';
import { getWrongExportedFunctionMarkers } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/getWrongExportedFunctionMarkers';
import { useActionHeaderTypeOrThrow } from '@/workflow/workflow-steps/workflow-actions/hooks/useActionHeaderTypeOrThrow';
import { useActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/hooks/useActionIconColorOrThrow';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';

import { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { AutoTypings } from 'monaco-editor-auto-typings';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { IconCode, IconPlayerPlay, useIcons } from 'twenty-ui/display';
import { CodeEditor } from 'twenty-ui/input';
import { useIsMobile } from 'twenty-ui/utilities';
import { useDebouncedCallback } from 'use-debounce';

const CODE_EDITOR_MIN_HEIGHT = 343;

const StyledCodeEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  flex: 1;
  min-height: ${CODE_EDITOR_MIN_HEIGHT}px;
  overflow: hidden;
`;

const StyledFullScreenOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.background.noisy};
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  z-index: ${RootStackingContextZIndices.Dialog};
`;

const StyledFullScreenHeader = styled(PageHeader)`
  padding-left: ${({ theme }) => theme.spacing(3)};
`;

const StyledFullScreenContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  height: calc(
    100% - ${PAGE_BAR_MIN_HEIGHT}px - ${({ theme }) => theme.spacing(2 * 2 + 5)}
  );
  padding: ${({ theme }) =>
    `0 ${theme.spacing(3)} ${theme.spacing(3)} ${theme.spacing(3)}`};
`;

const StyledTabList = styled(TabList)`
  background-color: ${({ theme }) => theme.background.secondary};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledFullScreenCodeEditorContainer = styled.div`
  flex: 1;
  min-height: 0;
`;

type WorkflowEditActionServerlessFunctionProps = {
  action: WorkflowCodeAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowCodeAction) => void;
      };
};

type ServerlessFunctionInputFormData = {
  [field: string]: string | ServerlessFunctionInputFormData;
};

export const WorkflowEditActionServerlessFunction = ({
  action,
  actionOptions,
}: WorkflowEditActionServerlessFunctionProps) => {
  const { getIcon } = useIcons();
  const { t } = useLingui();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const isMobile = useIsMobile();
  const fullScreenOverlayRef = useRef<HTMLDivElement>(null);
  const serverlessFunctionId = action.settings.input.serverlessFunctionId;
  const fullScreenFocusId = `code-editor-fullscreen-${serverlessFunctionId}`;
  const activeTabId = useRecoilComponentValueV2(
    activeTabIdComponentState,
    WORKFLOW_SERVERLESS_FUNCTION_TAB_LIST_COMPONENT_ID,
  );
  const { updateOneServerlessFunction } =
    useUpdateOneServerlessFunction(serverlessFunctionId);
  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();

  const workflowVisualizerWorkflowId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflow = useWorkflowWithCurrentVersion(workflowVisualizerWorkflowId);
  const { availablePackages } = useGetAvailablePackages({
    id: serverlessFunctionId,
  });

  const [serverlessFunctionTestData, setServerlessFunctionTestData] =
    useRecoilState(serverlessFunctionTestDataFamilyState(serverlessFunctionId));

  const [functionInput, setFunctionInput] =
    useState<ServerlessFunctionInputFormData>(
      action.settings.input.serverlessFunctionInput,
    );

  const { formValues, setFormValues, loading } =
    useServerlessFunctionUpdateFormState({
      serverlessFunctionId,
      serverlessFunctionVersion: 'draft',
    });

  const updateOutputSchemaFromTestResult = async (testResult: object) => {
    if (actionOptions.readonly === true) {
      return;
    }
    const newOutputSchema = getFunctionOutputSchema(testResult);
    updateAction({
      ...action,
      settings: { ...action.settings, outputSchema: newOutputSchema },
    });
  };

  const { testServerlessFunction, isTesting } = useTestServerlessFunction({
    serverlessFunctionId,
    callback: updateOutputSchemaFromTestResult,
  });

  const handleSave = useDebouncedCallback(async () => {
    await updateOneServerlessFunction({
      name: formValues.name,
      description: formValues.description,
      code: formValues.code,
    });
  }, 500);

  const onCodeChange = async (newCode: string) => {
    if (actionOptions.readonly === true) {
      return;
    }
    setFormValues((prevState) => ({
      ...prevState,
      code: { ...prevState.code, [INDEX_FILE_PATH]: newCode },
    }));
    await handleSave();
    await handleUpdateFunctionInputSchema(newCode);
  };

  const handleUpdateFunctionInputSchema = useDebouncedCallback(
    async (sourceCode: string) => {
      if (actionOptions.readonly === true) {
        return;
      }

      if (!isDefined(sourceCode)) {
        return;
      }

      const newFunctionInput = await getFunctionInputFromSourceCode(sourceCode);
      const newMergedInput = mergeDefaultFunctionInputAndFunctionInput({
        newInput: newFunctionInput,
        oldInput: action.settings.input.serverlessFunctionInput,
      });
      const newMergedTestInput = mergeDefaultFunctionInputAndFunctionInput({
        newInput: newFunctionInput,
        oldInput: serverlessFunctionTestData.input,
      });

      setFunctionInput(newMergedInput);
      setServerlessFunctionTestData((prev) => ({
        ...prev,
        input: newMergedTestInput,
      }));

      updateAction({
        ...action,
        settings: {
          ...action.settings,
          outputSchema: {
            link: {
              isLeaf: true,
              icon: 'IconVariable',
              tab: 'test',
              label: 'Generate Function Output',
            },
            _outputSchemaType: 'LINK',
          },
          input: {
            ...action.settings.input,
            serverlessFunctionInput: newMergedInput,
          },
        },
      });
    },
    500,
  );

  const handleInputChange = async (value: any, path: string[]) => {
    const updatedFunctionInput = setNestedValue(functionInput, path, value);

    setFunctionInput(updatedFunctionInput);

    updateAction({
      ...action,
      settings: {
        ...action.settings,
        input: {
          ...action.settings.input,
          serverlessFunctionInput: updatedFunctionInput,
        },
      },
    });
  };

  const handleTestInputChange = async (value: any, path: string[]) => {
    if (actionOptions.readonly === true) {
      return;
    }

    const updatedTestFunctionInput = setNestedValue(
      serverlessFunctionTestData.input,
      path,
      value,
    );
    setServerlessFunctionTestData((prev) => ({
      ...prev,
      input: updatedTestFunctionInput,
    }));
  };

  const handleRunFunction = async () => {
    if (actionOptions.readonly === true) {
      return;
    }

    if (!isTesting) {
      await testServerlessFunction();
    }
  };

  const handleEditorDidMount = async (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    await AutoTypings.create(editor, {
      monaco,
      preloadPackages: true,
      onlySpecifiedPackages: true,
      versions: availablePackages,
      debounceDuration: 0,
    });
  };

  const updateAction = useDebouncedCallback(
    (actionUpdate: Partial<WorkflowCodeAction>) => {
      if (actionOptions.readonly === true) {
        return;
      }

      actionOptions.onActionUpdate({
        ...action,
        ...actionUpdate,
      });
    },
    500,
  );

  const handleCodeChange = async (value: string) => {
    if (actionOptions.readonly === true || !isDefined(workflow)) {
      return;
    }
    await getUpdatableWorkflowVersion(workflow);
    await onCodeChange(value);
  };

  const tabs = [
    { id: WorkflowServerlessFunctionTabId.CODE, title: 'Code', Icon: IconCode },
    {
      id: WorkflowServerlessFunctionTabId.TEST,
      title: 'Test',
      Icon: IconPlayerPlay,
    },
  ];

  useEffect(() => {
    setFunctionInput(action.settings.input.serverlessFunctionInput);
  }, [action]);

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: () => {
      if (isFullScreen) {
        handleExitFullScreen();
      }
    },
    focusId: fullScreenFocusId,
    dependencies: [isFullScreen],
  });

  useListenClickOutside({
    refs: [fullScreenOverlayRef],
    callback: () => {
      if (isFullScreen) {
        handleExitFullScreen();
      }
    },
    listenerId: `full-screen-overlay-${serverlessFunctionId}`,
    enabled: isFullScreen,
  });

  const headerTitle = isDefined(action.name)
    ? action.name
    : 'Code - Serverless Function';
  const headerIcon = getActionIcon(action.type);
  const headerIconColor = useActionIconColorOrThrow(action.type);
  const headerType = useActionHeaderTypeOrThrow(action.type);

  const testLogsTextAreaId = `${serverlessFunctionId}-test-logs`;

  const handleEnterFullScreen = () => {
    setIsFullScreen(true);
    setTimeout(() => {
      if (isDefined(fullScreenOverlayRef.current)) {
        fullScreenOverlayRef.current.focus();
      }
    }, 0);
  };

  const handleExitFullScreen = () => {
    setIsFullScreen(false);
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
      children: t`Code Editor`,
    },
  ];

  const fullScreenOverlay = isFullScreen
    ? createPortal(
        <StyledFullScreenOverlay
          ref={fullScreenOverlayRef}
          data-globally-prevent-click-outside="true"
          tabIndex={-1}
        >
          <StyledFullScreenHeader
            title={<Breadcrumb links={breadcrumbLinks} />}
            hasClosePageButton={!isMobile}
            onClosePage={handleExitFullScreen}
          />
          <StyledFullScreenContent data-globally-prevent-click-outside="true">
            <WorkflowEditActionServerlessFunctionFields
              functionInput={functionInput}
              VariablePicker={WorkflowVariablePicker}
              onInputChange={handleInputChange}
              readonly={actionOptions.readonly}
            />
            <StyledFullScreenCodeEditorContainer>
              <CodeEditor
                height="100%"
                value={formValues.code?.[INDEX_FILE_PATH]}
                language={'typescript'}
                onChange={handleCodeChange}
                onMount={handleEditorDidMount}
                setMarkers={getWrongExportedFunctionMarkers}
                options={{
                  readOnly: actionOptions.readonly,
                  domReadOnly: actionOptions.readonly,
                  scrollBeyondLastLine: false,
                  padding: { top: 4, bottom: 4 },
                }}
              />
            </StyledFullScreenCodeEditorContainer>
          </StyledFullScreenContent>
        </StyledFullScreenOverlay>,
        document.body,
      )
    : null;

  return (
    !loading && (
      <>
        <StyledTabList
          tabs={tabs}
          behaveAsLinks={false}
          componentInstanceId={
            WORKFLOW_SERVERLESS_FUNCTION_TAB_LIST_COMPONENT_ID
          }
        />
        <WorkflowStepHeader
          onTitleChange={(newName: string) => {
            updateAction({ name: newName });
          }}
          Icon={getIcon(headerIcon)}
          iconColor={headerIconColor}
          initialTitle={headerTitle}
          headerType={headerType}
          disabled={actionOptions.readonly}
        />
        <WorkflowStepBody>
          {activeTabId === WorkflowServerlessFunctionTabId.CODE && (
            <>
              <WorkflowEditActionServerlessFunctionFields
                functionInput={functionInput}
                VariablePicker={WorkflowVariablePicker}
                onInputChange={handleInputChange}
                readonly={actionOptions.readonly}
              />
              <WorkflowServerlessFunctionCodeEditor
                value={formValues.code?.[INDEX_FILE_PATH]}
                onChange={handleCodeChange}
                onMount={handleEditorDidMount}
                options={{
                  readOnly: actionOptions.readonly,
                  domReadOnly: actionOptions.readonly,
                  scrollBeyondLastLine: false,
                  padding: { top: 4, bottom: 4 },
                  lineNumbersMinChars: 2,
                }}
                readonly={actionOptions.readonly}
                onEnterFullScreen={handleEnterFullScreen}
              />
            </>
          )}
          {activeTabId === WorkflowServerlessFunctionTabId.TEST && (
            <>
              <WorkflowEditActionServerlessFunctionFields
                functionInput={serverlessFunctionTestData.input}
                onInputChange={handleTestInputChange}
                readonly={actionOptions.readonly}
              />
              <StyledCodeEditorContainer>
                <InputLabel>Result</InputLabel>
                <ServerlessFunctionExecutionResult
                  serverlessFunctionTestData={serverlessFunctionTestData}
                  isTesting={isTesting}
                />
              </StyledCodeEditorContainer>
              {serverlessFunctionTestData.output.logs.length > 0 && (
                <StyledCodeEditorContainer>
                  <InputLabel>Logs</InputLabel>
                  <TextArea
                    textAreaId={testLogsTextAreaId}
                    value={
                      isTesting ? '' : serverlessFunctionTestData.output.logs
                    }
                    maxRows={20}
                    disabled
                  />
                </StyledCodeEditorContainer>
              )}
            </>
          )}
        </WorkflowStepBody>
        {activeTabId === WorkflowServerlessFunctionTabId.TEST && (
          <RightDrawerFooter
            actions={[
              <CmdEnterActionButton
                title="Test"
                onClick={handleRunFunction}
                disabled={isTesting || actionOptions.readonly}
              />,
            ]}
          />
        )}
        {fullScreenOverlay}
      </>
    )
  );
};
