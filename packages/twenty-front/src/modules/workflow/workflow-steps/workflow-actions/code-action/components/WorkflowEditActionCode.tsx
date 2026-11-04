import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useGetLogicFunctionSourceCode } from '@/logic-functions/hooks/useGetLogicFunctionSourceCode';
import { useFullScreenModal } from '@/ui/layout/fullscreen/hooks/useFullScreenModal';
import { TabListRoot } from '@/ui/layout/tab-list/components/TabListRoot';
import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/types/BreadcrumbProps';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { type WorkflowCodeAction } from '@/workflow/types/Workflow';
import { WorkflowStepTabPanel } from '@/workflow/workflow-steps/components/WorkflowStepTabPanel';

import { LogicFunctionExecutionResult } from '@/logic-functions/components/LogicFunctionExecutionResult';
import { LogicFunctionLogs } from '@/logic-functions/components/LogicFunctionLogs';
import { InputLabel } from '@/ui/input/components/internal/InputLabel/InputLabel';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { WorkflowExpectedOutputBodyInput } from '@/workflow/workflow-steps/components/WorkflowExpectedOutputBodyInput';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepCmdEnterButton } from '@/workflow/workflow-steps/components/WorkflowStepCmdEnterButton';
import { WorkflowCodeEditor } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowCodeEditor';
import { WorkflowEditActionCodeFields } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowEditActionCodeFields';
import { WorkflowCodeStepInputSchemaEffect } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowCodeStepInputSchemaEffect';
import { codeStepInputSchemaFamilyState } from '@/workflow/workflow-steps/workflow-actions/code-action/states/codeStepInputSchemaFamilyState';
import { setNestedValue } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/setNestedValue';
import { useWorkflowCodeStepForm } from '@/workflow/workflow-steps/workflow-actions/code-action/hooks/useWorkflowCodeStepForm';
import { useTestWorkflowCodeStep } from '@/workflow/workflow-steps/workflow-actions/code-action/hooks/useTestWorkflowCodeStep';
import { useWorkflowCodeStepAvailablePackages } from '@/workflow/workflow-steps/workflow-actions/code-action/hooks/useWorkflowCodeStepAvailablePackages';
import { WORKFLOW_LOGIC_FUNCTION_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/workflow-actions/code-action/constants/WorkflowLogicFunctionTabListComponentId';
import { WorkflowLogicFunctionTabId } from '@/workflow/workflow-steps/workflow-actions/code-action/types/WorkflowLogicFunctionTabId';
import { getWrongExportedFunctionMarkers } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/getWrongExportedFunctionMarkers';
import { mergeDefaultFunctionInputAndFunctionInput } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/mergeDefaultFunctionInputAndFunctionInput';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { CodeEditor } from 'twenty-ui/components/code-editor';

import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { getWorkflowStepDisplayName } from '@/workflow/utils/getWorkflowStepDisplayName';
import { CODE_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/CodeAction';
import { type Monaco } from '@monaco-editor/react';
import { type editor } from 'monaco-editor';
import { AutoTypings } from 'monaco-editor-auto-typings';
import { useState } from 'react';
import { Key } from 'ts-key-enum';
import { getOutputSchemaFromValue } from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';
import { IconCode, IconPlayerPlay } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledCodeEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const StyledTabListContainer = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  padding-left: ${themeCssVariables.spacing[2]};
`;

const StyledFullScreenCodeEditorContainer = styled.div`
  flex: 1;
  min-height: 0;
`;

type WorkflowEditActionCodeProps = {
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

export const WorkflowEditActionCode = ({
  action,
  actionOptions,
}: WorkflowEditActionCodeProps) => {
  const { t } = useLingui();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const isMobile = useIsMobile();
  const fullScreenFocusId = `code-editor-fullscreen-${action.id}`;
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    WORKFLOW_LOGIC_FUNCTION_TAB_LIST_COMPONENT_ID,
  );

  const workflowVisualizerWorkflowId = useAtomComponentStateValue(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflow = useWorkflowWithCurrentVersion(workflowVisualizerWorkflowId);
  const workflowVersionId = workflow?.currentVersion.id;

  // Steps created before inline code keep their source in a logic function until their first edit
  const legacyLogicFunctionId = isDefined(action.settings.input.code)
    ? undefined
    : action.settings.input.logicFunctionId;

  const { sourceHandlerCode: legacySourceCode, loading } =
    useGetLogicFunctionSourceCode({
      logicFunctionId: legacyLogicFunctionId ?? '',
    });

  const savedCode = action.settings.input.code ?? legacySourceCode ?? undefined;

  const codeStepInputSchema = useAtomFamilyStateValue(
    codeStepInputSchemaFamilyState,
    action.id,
  );

  const { availablePackages, isAvailablePackagesInitialLoading } =
    useWorkflowCodeStepAvailablePackages(workflowVersionId);

  const {
    testWorkflowCodeStep,
    isTesting,
    logicFunctionTestData,
    updateLogicFunctionTestInput,
  } = useTestWorkflowCodeStep({ stepId: action.id });

  const {
    code,
    functionInput,
    handleCodeChange,
    handleFunctionInputChange,
    saveSettings,
    getCodeEditGeneration,
  } = useWorkflowCodeStepForm({
    action,
    savedCode,
    onActionUpdate:
      actionOptions.readonly === true
        ? undefined
        : actionOptions.onActionUpdate,
    onFunctionInputInferred: (inferredFunctionInput) =>
      updateLogicFunctionTestInput(
        mergeDefaultFunctionInputAndFunctionInput({
          newInput: inferredFunctionInput,
          oldInput: logicFunctionTestData.input,
        }),
      ),
  });

  const handleExpectedOutputBodyChange = (
    parsedValue: Record<string, unknown>,
  ) => saveSettings({ expectedOutputSchema: parsedValue });

  const handleTestInputChange = async (value: any, path: string[]) => {
    if (actionOptions.readonly === true) {
      return;
    }

    updateLogicFunctionTestInput(
      setNestedValue(logicFunctionTestData.input, path, value),
    );
  };

  const handleTestFunction = async () => {
    if (
      actionOptions.readonly === true ||
      !isDefined(workflowVersionId) ||
      !isDefined(code)
    ) {
      return;
    }

    const codeEditGeneration = getCodeEditGeneration();

    const testResult = await testWorkflowCodeStep({ workflowVersionId, code });

    if (
      !isDefined(testResult) ||
      codeEditGeneration !== getCodeEditGeneration()
    ) {
      return;
    }

    saveSettings({ outputSchema: getOutputSchemaFromValue(testResult) });
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

  const tabs = [
    {
      id: WorkflowLogicFunctionTabId.CODE,
      title: t`Code`,
      Icon: IconCode,
    },
    {
      id: WorkflowLogicFunctionTabId.TEST,
      title: t`Test`,
      Icon: IconPlayerPlay,
    },
  ];

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

  const breadcrumbLinks: BreadcrumbProps['links'] = [
    {
      children: workflow?.name?.trim() || t`Untitled Workflow`,
      href: '#',
    },
    {
      children: isDefined(action.name)
        ? getWorkflowStepDisplayName({ name: action.name, type: action.type })
        : t(CODE_ACTION.defaultLabel),
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
    listenerId: `full-screen-overlay-${action.id}`,
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

  const fullScreenOverlay = renderFullScreenModal(
    <div data-globally-prevent-click-outside="true">
      <WorkflowEditActionCodeFields
        functionInput={functionInput}
        inputSchema={codeStepInputSchema}
        VariablePicker={WorkflowVariablePicker}
        onInputChange={handleFunctionInputChange}
        readonly={actionOptions.readonly}
      />
      <StyledFullScreenCodeEditorContainer>
        <CodeEditor
          height="100%"
          value={code}
          language="typescript"
          onChange={(newCode) =>
            isDefined(newCode) && handleCodeChange(newCode)
          }
          onMount={handleEditorDidMount}
          setMarkers={getWrongExportedFunctionMarkers}
          options={{
            readOnly: actionOptions.readonly,
            domReadOnly: actionOptions.readonly,
            scrollBeyondLastLine: false,
          }}
        />
      </StyledFullScreenCodeEditorContainer>
    </div>,
    isFullScreen,
  );

  // AutoTypings only reads the package versions when the editor mounts
  const isInitialLoading =
    (loading && !isDefined(code)) || isAvailablePackagesInitialLoading;

  return (
    <>
      <WorkflowCodeStepInputSchemaEffect
        stepId={action.id}
        sourceCode={savedCode}
      />
      {!isInitialLoading && (
        <TabListRoot
          componentInstanceId={WORKFLOW_LOGIC_FUNCTION_TAB_LIST_COMPONENT_ID}
        >
          <StyledTabListContainer>
            <TabList
              aria-label={t`Code step`}
              tabs={tabs}
              behaveAsLinks={false}
              componentInstanceId={
                WORKFLOW_LOGIC_FUNCTION_TAB_LIST_COMPONENT_ID
              }
            />
          </StyledTabListContainer>
          <WorkflowStepTabPanel value={activeTabId ?? ''}>
            <WorkflowStepBody>
              {activeTabId === WorkflowLogicFunctionTabId.CODE && (
                <>
                  <WorkflowEditActionCodeFields
                    functionInput={functionInput}
                    inputSchema={codeStepInputSchema}
                    VariablePicker={WorkflowVariablePicker}
                    onInputChange={handleFunctionInputChange}
                    readonly={actionOptions.readonly}
                  />
                  <WorkflowCodeEditor
                    value={code}
                    onChange={(newCode) =>
                      isDefined(newCode) && handleCodeChange(newCode)
                    }
                    onMount={handleEditorDidMount}
                    options={{
                      readOnly: actionOptions.readonly,
                      domReadOnly: actionOptions.readonly,
                      scrollBeyondLastLine: false,
                      lineNumbersMinChars: 2,
                      fixedOverflowWidgets: true,
                    }}
                    readonly={actionOptions.readonly}
                    onEnterFullScreen={handleEnterFullScreen}
                  />
                  <WorkflowExpectedOutputBodyInput
                    defaultValue={action.settings.expectedOutputSchema}
                    onChange={handleExpectedOutputBodyChange}
                    readonly={actionOptions.readonly}
                  />
                </>
              )}
              {activeTabId === WorkflowLogicFunctionTabId.TEST && (
                <>
                  <WorkflowEditActionCodeFields
                    functionInput={logicFunctionTestData.input}
                    inputSchema={codeStepInputSchema}
                    onInputChange={handleTestInputChange}
                    readonly={actionOptions.readonly}
                  />
                  <StyledCodeEditorContainer>
                    <InputLabel>{t`Result`}</InputLabel>
                    <LogicFunctionExecutionResult
                      logicFunctionTestData={logicFunctionTestData}
                      isTesting={isTesting}
                    />
                  </StyledCodeEditorContainer>
                  {logicFunctionTestData.output.logs.length > 0 && (
                    <StyledCodeEditorContainer>
                      <LogicFunctionLogs
                        componentInstanceId={`workflow-edit-action-logs-${action.id}`}
                        value={
                          isTesting ? '' : logicFunctionTestData.output.logs
                        }
                      />
                    </StyledCodeEditorContainer>
                  )}
                </>
              )}
            </WorkflowStepBody>
          </WorkflowStepTabPanel>
          {!actionOptions.readonly && (
            <WorkflowStepFooter
              stepId={action.id}
              additionalActions={
                activeTabId === WorkflowLogicFunctionTabId.TEST
                  ? [
                      <WorkflowStepCmdEnterButton
                        title={t`Test`}
                        onClick={handleTestFunction}
                        disabled={isTesting}
                      />,
                    ]
                  : []
              }
            />
          )}
          {fullScreenOverlay}
        </TabListRoot>
      )}
    </>
  );
};
