import { useGetAvailablePackages } from '@/settings/serverless-functions/hooks/useGetAvailablePackages';
import { useServerlessFunctionUpdateFormState } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { useFullScreenModal } from '@/ui/layout/fullscreen/hooks/useFullScreenModal';
import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { type WorkflowCodeAction } from '@/workflow/types/Workflow';
import { setNestedValue } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/setNestedValue';

import { CmdEnterActionButton } from '@/action-menu/components/CmdEnterActionButton';
import { ServerlessFunctionExecutionResult } from '@/serverless-functions/components/ServerlessFunctionExecutionResult';
import { INDEX_FILE_NAME } from '@/serverless-functions/constants/IndexFileName';
import { useTestServerlessFunction } from '@/serverless-functions/hooks/useTestServerlessFunction';
import { getFunctionInputFromSourceCode } from '@/serverless-functions/utils/getFunctionInputFromSourceCode';
import { mergeDefaultFunctionInputAndFunctionInput } from '@/serverless-functions/utils/mergeDefaultFunctionInputAndFunctionInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { TextArea } from '@/ui/input/components/TextArea';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowEditActionServerlessFunctionFields } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowEditActionServerlessFunctionFields';
import { WorkflowServerlessFunctionCodeEditor } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowServerlessFunctionCodeEditor';
import { WORKFLOW_SERVERLESS_FUNCTION_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/workflow-actions/code-action/constants/WorkflowServerlessFunctionTabListComponentId';
import { serverlessFunctionTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/code-action/states/serverlessFunctionTestDataFamilyState';
import { WorkflowServerlessFunctionTabId } from '@/workflow/workflow-steps/workflow-actions/code-action/types/WorkflowServerlessFunctionTabId';
import { getWrongExportedFunctionMarkers } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/getWrongExportedFunctionMarkers';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';

import { SOURCE_FOLDER_NAME } from '@/serverless-functions/constants/SourceFolderName';
import { computeNewSources } from '@/serverless-functions/utils/computeNewSources';
import { usePersistServerlessFunction } from '@/settings/serverless-functions/hooks/usePersistServerlessFunction';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { CODE_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/CodeAction';
import { type Monaco } from '@monaco-editor/react';
import { type editor } from 'monaco-editor';
import { AutoTypings } from 'monaco-editor-auto-typings';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { buildOutputSchemaFromValue } from 'twenty-shared/workflow';
import { IconCode, IconPlayerPlay } from 'twenty-ui/display';
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
  const { t } = useLingui();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const isMobile = useIsMobile();
  const serverlessFunctionId = action.settings.input.serverlessFunctionId;
  const fullScreenFocusId = `code-editor-fullscreen-${serverlessFunctionId}`;
  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    WORKFLOW_SERVERLESS_FUNCTION_TAB_LIST_COMPONENT_ID,
  );
  const { updateServerlessFunction } = usePersistServerlessFunction();
  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow();

  const workflowVisualizerWorkflowId = useRecoilComponentValue(
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
    const newOutputSchema = buildOutputSchemaFromValue(testResult);
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
    await updateServerlessFunction({
      input: {
        id: serverlessFunctionId,
        update: {
          name: formValues.name,
          description: formValues.description,
          code: formValues.code,
        },
      },
    });
  }, 500);

  const onCodeChange = async (newCode: string) => {
    if (actionOptions.readonly === true) {
      return;
    }
    setFormValues((prevState) => {
      return {
        ...prevState,
        code: computeNewSources({
          previousCode: prevState['code'],
          filePath: `${SOURCE_FOLDER_NAME}/${INDEX_FILE_NAME}`,
          value: newCode,
        }),
      };
    });
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
              label: t`Generate Function Output`,
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
    await getUpdatableWorkflowVersion();
    await onCodeChange(value);
  };

  const tabs = [
    {
      id: WorkflowServerlessFunctionTabId.CODE,
      title: t`Code`,
      Icon: IconCode,
    },
    {
      id: WorkflowServerlessFunctionTabId.TEST,
      title: t`Test`,
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

  const testLogsTextAreaId = `${serverlessFunctionId}-test-logs`;

  const breadcrumbLinks: BreadcrumbProps['links'] = [
    {
      children: workflow?.name?.trim() || t`Untitled Workflow`,
      href: '#',
    },
    {
      children: isDefined(action.name) ? action.name : CODE_ACTION.defaultLabel,
      href: '#',
    },
    {
      children: t`Code Editor`,
    },
  ];

  const { overlayRef: fullScreenOverlayRef, renderFullScreenModal } =
    useFullScreenModal({
      links: breadcrumbLinks,
      onClose: () => setIsFullScreen(false),
      hasClosePageButton: !isMobile,
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

  const indexFileContent =
    typeof formValues.code?.[SOURCE_FOLDER_NAME] !== 'string' &&
    typeof formValues.code[SOURCE_FOLDER_NAME][INDEX_FILE_NAME] === 'string'
      ? formValues.code[SOURCE_FOLDER_NAME][INDEX_FILE_NAME]
      : '';

  const fullScreenOverlay = renderFullScreenModal(
    <div data-globally-prevent-click-outside="true">
      <WorkflowEditActionServerlessFunctionFields
        functionInput={functionInput}
        VariablePicker={WorkflowVariablePicker}
        onInputChange={handleInputChange}
        readonly={actionOptions.readonly}
      />
      <StyledFullScreenCodeEditorContainer>
        <CodeEditor
          height="100%"
          value={indexFileContent}
          language="typescript"
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
    </div>,
    isFullScreen,
  );

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
                value={indexFileContent}
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
                <InputLabel>{t`Result`}</InputLabel>
                <ServerlessFunctionExecutionResult
                  serverlessFunctionTestData={serverlessFunctionTestData}
                  isTesting={isTesting}
                />
              </StyledCodeEditorContainer>
              {serverlessFunctionTestData.output.logs.length > 0 && (
                <StyledCodeEditorContainer>
                  <InputLabel>{t`Logs`}</InputLabel>
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
        {!actionOptions.readonly && (
          <WorkflowStepFooter
            stepId={action.id}
            additionalActions={
              activeTabId === WorkflowServerlessFunctionTabId.TEST
                ? [
                    <CmdEnterActionButton
                      title={t`Test`}
                      onClick={handleRunFunction}
                      disabled={isTesting}
                    />,
                  ]
                : []
            }
          />
        )}
        {fullScreenOverlay}
      </>
    )
  );
};
