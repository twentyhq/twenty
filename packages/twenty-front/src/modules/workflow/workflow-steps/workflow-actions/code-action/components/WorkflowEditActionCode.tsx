import { useGetAvailablePackages } from '@/logic-functions/hooks/useGetAvailablePackages';
import { useLogicFunctionForm } from '@/logic-functions/hooks/useLogicFunctionForm';
import { useFullScreenModal } from '@/ui/layout/fullscreen/hooks/useFullScreenModal';
import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { type WorkflowCodeAction } from '@/workflow/types/Workflow';
import { setNestedValue } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/setNestedValue';

import { LogicFunctionExecutionResult } from '@/logic-functions/components/LogicFunctionExecutionResult';
import { LogicFunctionLogs } from '@/logic-functions/components/LogicFunctionLogs';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepCmdEnterButton } from '@/workflow/workflow-steps/components/WorkflowStepCmdEnterButton';
import { WorkflowCodeEditor } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowCodeEditor';
import { WorkflowEditActionCodeFields } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowEditActionCodeFields';
import { WORKFLOW_LOGIC_FUNCTION_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/workflow-actions/code-action/constants/WorkflowLogicFunctionTabListComponentId';
import { WorkflowLogicFunctionTabId } from '@/workflow/workflow-steps/workflow-actions/code-action/types/WorkflowLogicFunctionTabId';
import { getWrongExportedFunctionMarkers } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/getWrongExportedFunctionMarkers';
import { mergeDefaultFunctionInputAndFunctionInput } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/mergeDefaultFunctionInputAndFunctionInput';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { LogicFunctionTestInputInitEffect } from '@/logic-functions/components/LogicFunctionTestInputInitEffect';
import { useExecuteLogicFunction } from '@/logic-functions/hooks/useExecuteLogicFunction';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { CODE_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/CodeAction';
import { type Monaco } from '@monaco-editor/react';
import { type editor } from 'monaco-editor';
import { AutoTypings } from 'monaco-editor-auto-typings';
import { useRef, useState } from 'react';
import { Key } from 'ts-key-enum';
import {
  getOutputSchemaFromValue,
  jsonSchemaToInputSchema,
  type InputJsonSchema,
} from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';
import { getFunctionInputFromInputSchema } from 'twenty-shared/workflow';
import { IconCode, IconPlayerPlay } from 'twenty-ui-deprecated/display';
import { CodeEditor } from 'twenty-ui-deprecated/input';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';
import { useIsMobile } from 'twenty-ui-deprecated/utilities';
import { useDebouncedCallback } from 'use-debounce';

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

type LogicFunctionInputFormData = {
  [field: string]: string | LogicFunctionInputFormData;
};

export const WorkflowEditActionCode = ({
  action,
  actionOptions,
}: WorkflowEditActionCodeProps) => {
  const { t } = useLingui();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const isMobile = useIsMobile();
  const logicFunctionId = action.settings.input.logicFunctionId;
  const fullScreenFocusId = `code-editor-fullscreen-${logicFunctionId}`;
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    WORKFLOW_LOGIC_FUNCTION_TAB_LIST_COMPONENT_ID,
  );
  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow();

  const workflowVisualizerWorkflowId = useAtomComponentStateValue(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflow = useWorkflowWithCurrentVersion(workflowVisualizerWorkflowId);

  // Several handlers below update different parts of the action settings
  // (code input, function input, output schema). They all funnel through a
  // single debounced persist call. To avoid a late-firing update built from a
  // stale `action` snapshot reverting a more recent change (e.g. an input edit
  // wiping the freshly inferred output schema back to its LINK placeholder,
  // which makes referencing variables resolve to "Not found"), we accumulate
  // partial settings deltas and always merge them against the latest action.
  const latestActionRef = useRef(action);
  latestActionRef.current = action;

  const pendingSettingsUpdateRef = useRef<
    Partial<WorkflowCodeAction['settings']>
  >({});

  const flushActionUpdate = useDebouncedCallback(() => {
    const pendingSettingsUpdate = pendingSettingsUpdateRef.current;
    pendingSettingsUpdateRef.current = {};

    if (
      actionOptions.readonly === true ||
      Object.keys(pendingSettingsUpdate).length === 0
    ) {
      return;
    }

    actionOptions.onActionUpdate({
      ...latestActionRef.current,
      settings: {
        ...latestActionRef.current.settings,
        ...pendingSettingsUpdate,
      },
    });
  }, 500);

  const updateActionSettings = (
    settingsUpdate: Partial<WorkflowCodeAction['settings']>,
  ) => {
    if (actionOptions.readonly === true) {
      return;
    }

    pendingSettingsUpdateRef.current = {
      ...pendingSettingsUpdateRef.current,
      ...settingsUpdate,
    };

    flushActionUpdate();
  };

  const updateOutputSchemaFromTestResult = async (testResult: object) => {
    if (actionOptions.readonly === true) {
      return;
    }
    const newOutputSchema = getOutputSchemaFromValue(testResult);
    updateActionSettings({ outputSchema: newOutputSchema });
  };

  const { formValues, loading, onChange } = useLogicFunctionForm({
    logicFunctionId,
  });

  const {
    executeLogicFunction,
    isExecuting,
    logicFunctionTestData,
    updateLogicFunctionInput,
  } = useExecuteLogicFunction({
    logicFunctionId,
    callback: updateOutputSchemaFromTestResult,
  });

  const { availablePackages } = useGetAvailablePackages({
    id: logicFunctionId,
  });

  const [functionInput, setFunctionInput] =
    useState<LogicFunctionInputFormData>(
      action.settings.input.logicFunctionInput ?? {},
    );

  const handleUpdateFunctionInputSchema = useDebouncedCallback(
    async (sourceCode: string, inferredJsonSchema: InputJsonSchema) => {
      if (actionOptions.readonly === true) {
        return;
      }

      if (!isDefined(sourceCode)) {
        return;
      }

      const inputSchema = jsonSchemaToInputSchema(inferredJsonSchema);

      const newFunctionInput = getFunctionInputFromInputSchema(inputSchema)[0];

      const newMergedInput = mergeDefaultFunctionInputAndFunctionInput({
        newInput: newFunctionInput,
        oldInput: latestActionRef.current.settings.input.logicFunctionInput,
      });

      const newMergedTestInput = mergeDefaultFunctionInputAndFunctionInput({
        newInput: newFunctionInput,
        oldInput: logicFunctionTestData.input,
      });

      setFunctionInput(newMergedInput);

      updateLogicFunctionInput(newMergedTestInput);

      updateActionSettings({
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
          ...latestActionRef.current.settings.input,
          logicFunctionInput: newMergedInput,
        },
      });
    },
    500,
  );

  const handleInputChange = async (value: any, path: string[]) => {
    const updatedFunctionInput = setNestedValue(functionInput, path, value);

    setFunctionInput(updatedFunctionInput);

    updateActionSettings({
      input: {
        ...latestActionRef.current.settings.input,
        logicFunctionInput: updatedFunctionInput,
      },
    });
  };

  const handleTestInputChange = async (value: any, path: string[]) => {
    if (actionOptions.readonly === true) {
      return;
    }

    const updatedTestFunctionInput = setNestedValue(
      logicFunctionTestData.input,
      path,
      value,
    );

    updateLogicFunctionInput(updatedTestFunctionInput);
  };

  const handleTestFunction = async () => {
    if (actionOptions.readonly === true) {
      return;
    }

    // A pending schema-inference update would reset the output schema back to
    // its LINK placeholder. If it fired after the test result resolved the real
    // output schema, variables would resolve to "Not found". Cancel the
    // debounced inference and drop any output-schema reset already queued in
    // the accumulator so the test result stays the source of truth.
    handleUpdateFunctionInputSchema.cancel();

    const remainingPendingUpdate = { ...pendingSettingsUpdateRef.current };
    delete remainingPendingUpdate.outputSchema;
    pendingSettingsUpdateRef.current = remainingPendingUpdate;

    await executeLogicFunction();
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

  const handleCodeChange = async (newCode: string) => {
    if (actionOptions.readonly === true || !isDefined(workflow)) {
      return;
    }

    const inferredJsonSchema = await onChange('sourceHandlerCode')(newCode);

    await getUpdatableWorkflowVersion();

    if (isDefined(inferredJsonSchema)) {
      await handleUpdateFunctionInputSchema(newCode, inferredJsonSchema);
    }
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
    listenerId: `full-screen-overlay-${logicFunctionId}`,
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
        inputSchema={formValues.workflowActionTriggerSettings?.inputSchema}
        VariablePicker={WorkflowVariablePicker}
        onInputChange={handleInputChange}
        readonly={actionOptions.readonly}
      />
      <StyledFullScreenCodeEditorContainer>
        <CodeEditor
          height="100%"
          value={formValues.sourceHandlerCode}
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
        <LogicFunctionTestInputInitEffect logicFunctionId={logicFunctionId} />
        <StyledTabListContainer>
          <TabList
            tabs={tabs}
            behaveAsLinks={false}
            componentInstanceId={WORKFLOW_LOGIC_FUNCTION_TAB_LIST_COMPONENT_ID}
          />
        </StyledTabListContainer>
        <WorkflowStepBody>
          {activeTabId === WorkflowLogicFunctionTabId.CODE && (
            <>
              <WorkflowEditActionCodeFields
                functionInput={functionInput}
                inputSchema={
                  formValues.workflowActionTriggerSettings?.inputSchema
                }
                VariablePicker={WorkflowVariablePicker}
                onInputChange={handleInputChange}
                readonly={actionOptions.readonly}
              />
              <WorkflowCodeEditor
                value={formValues.sourceHandlerCode}
                onChange={handleCodeChange}
                onMount={handleEditorDidMount}
                options={{
                  readOnly: actionOptions.readonly,
                  domReadOnly: actionOptions.readonly,
                  scrollBeyondLastLine: false,
                  padding: { top: 4, bottom: 4 },
                  lineNumbersMinChars: 2,
                  fixedOverflowWidgets: true,
                }}
                readonly={actionOptions.readonly}
                onEnterFullScreen={handleEnterFullScreen}
              />
            </>
          )}
          {activeTabId === WorkflowLogicFunctionTabId.TEST && (
            <>
              <WorkflowEditActionCodeFields
                functionInput={logicFunctionTestData.input}
                inputSchema={
                  formValues.workflowActionTriggerSettings?.inputSchema
                }
                onInputChange={handleTestInputChange}
                readonly={actionOptions.readonly}
              />
              <StyledCodeEditorContainer>
                <InputLabel>{t`Result`}</InputLabel>
                <LogicFunctionExecutionResult
                  logicFunctionTestData={logicFunctionTestData}
                  isTesting={isExecuting}
                />
              </StyledCodeEditorContainer>
              {logicFunctionTestData.output.logs.length > 0 && (
                <StyledCodeEditorContainer>
                  <LogicFunctionLogs
                    componentInstanceId={`workflow-edit-action-logs-${action.id}`}
                    value={isExecuting ? '' : logicFunctionTestData.output.logs}
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
              activeTabId === WorkflowLogicFunctionTabId.TEST
                ? [
                    <WorkflowStepCmdEnterButton
                      title={t`Test`}
                      onClick={handleTestFunction}
                      disabled={isExecuting}
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
