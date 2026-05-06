import { LogicFunctionExecutionResult } from '@/logic-functions/components/LogicFunctionExecutionResult';
import { LogicFunctionLogs } from '@/logic-functions/components/LogicFunctionLogs';
import { LogicFunctionTestInputInitEffect } from '@/logic-functions/components/LogicFunctionTestInputInitEffect';
import { useExecuteLogicFunction } from '@/logic-functions/hooks/useExecuteLogicFunction';
import { useGetOneLogicFunction } from '@/logic-functions/hooks/useGetOneLogicFunction';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type WorkflowLogicFunctionAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepCmdEnterButton } from '@/workflow/workflow-steps/components/WorkflowStepCmdEnterButton';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowEditActionCodeFields } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowEditActionCodeFields';
import { mergeDefaultFunctionInputAndFunctionInput } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/mergeDefaultFunctionInputAndFunctionInput';
import { setNestedValue } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/setNestedValue';
import { WORKFLOW_LOGIC_FUNCTION_ACTION_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/workflow-actions/logic-function-action/constants/WorkflowLogicFunctionActionTabListComponentId';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isObject } from '@sniptt/guards';
import { useMemo } from 'react';
import { getOutputSchemaFromValue } from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';
import { getFunctionInputFromInputSchema } from 'twenty-shared/workflow';
import {
  Callout,
  IconPlayerPlay,
  IconSettingsAutomation,
} from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useDebouncedCallback } from 'use-debounce';

const INPUT_TAB_ID = 'input';
const TEST_TAB_ID = 'test';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledTabListContainer = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  padding-left: ${themeCssVariables.spacing[2]};
`;

const StyledResultContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

type WorkflowEditActionLogicFunctionProps = {
  action: WorkflowLogicFunctionAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowLogicFunctionAction) => void;
      };
};

export const WorkflowEditActionLogicFunction = ({
  action,
  actionOptions,
}: WorkflowEditActionLogicFunctionProps) => {
  const { t } = useLingui();

  const logicFunctionId = action.settings.input.logicFunctionId;

  const { logicFunction, loading } = useGetOneLogicFunction({
    id: logicFunctionId,
  });

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    WORKFLOW_LOGIC_FUNCTION_ACTION_TAB_LIST_COMPONENT_ID,
  );

  const functionInput = useMemo(() => {
    const inputSchema =
      logicFunction?.workflowActionTriggerSettings?.inputSchema;

    if (!isDefined(inputSchema)) {
      return action.settings.input.logicFunctionInput ?? {};
    }

    const defaultInput = getFunctionInputFromInputSchema(inputSchema)[0];

    if (!isObject(defaultInput)) {
      return action.settings.input.logicFunctionInput ?? {};
    }

    return mergeDefaultFunctionInputAndFunctionInput({
      newInput: defaultInput,
      oldInput: action.settings.input.logicFunctionInput ?? {},
    });
  }, [
    logicFunction?.workflowActionTriggerSettings?.inputSchema,
    action.settings.input.logicFunctionInput,
  ]);

  const updateAction = useDebouncedCallback(
    (actionUpdate: Partial<WorkflowLogicFunctionAction>) => {
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

  const updateOutputSchemaFromTestResult = (testResult: object) => {
    if (actionOptions.readonly === true) {
      return;
    }

    const newOutputSchema = getOutputSchemaFromValue(testResult);

    updateAction({
      ...action,
      settings: { ...action.settings, outputSchema: newOutputSchema },
    });
  };

  const {
    executeLogicFunction,
    isExecuting,
    logicFunctionTestData,
    updateLogicFunctionInput,
  } = useExecuteLogicFunction({
    logicFunctionId,
    callback: updateOutputSchemaFromTestResult,
  });

  const testInput = mergeDefaultFunctionInputAndFunctionInput({
    newInput: functionInput,
    oldInput: logicFunctionTestData.input,
  });

  const handleInputChange = (value: unknown, path: string[]) => {
    const updatedFunctionInput = setNestedValue(functionInput, path, value);

    updateAction({
      settings: {
        ...action.settings,
        input: {
          ...action.settings.input,
          logicFunctionInput: updatedFunctionInput,
        },
      },
    });
  };

  const handleTestInputChange = (value: unknown, path: string[]) => {
    if (actionOptions.readonly === true) {
      return;
    }

    const updatedTestFunctionInput = setNestedValue(testInput, path, value);

    updateLogicFunctionInput(updatedTestFunctionInput);
  };

  const handleTestFunction = async () => {
    if (actionOptions.readonly === true) {
      return;
    }

    await executeLogicFunction();
  };

  if (loading) {
    return null;
  }

  const hasInputFields = Object.keys(functionInput).length > 0;

  const tabs = [
    {
      id: INPUT_TAB_ID,
      title: t`Input`,
      Icon: IconSettingsAutomation,
    },
    {
      id: TEST_TAB_ID,
      title: t`Test`,
      Icon: IconPlayerPlay,
    },
  ];

  return (
    <>
      <LogicFunctionTestInputInitEffect logicFunctionId={logicFunctionId} />
      <StyledTabListContainer>
        <TabList
          tabs={tabs}
          behaveAsLinks={false}
          componentInstanceId={
            WORKFLOW_LOGIC_FUNCTION_ACTION_TAB_LIST_COMPONENT_ID
          }
        />
      </StyledTabListContainer>
      <WorkflowStepBody>
        {activeTabId === TEST_TAB_ID ? (
          <>
            <WorkflowEditActionCodeFields
              functionInput={testInput}
              onInputChange={handleTestInputChange}
              readonly={actionOptions.readonly}
            />
            <StyledResultContainer>
              <InputLabel>{t`Result`}</InputLabel>
              <LogicFunctionExecutionResult
                logicFunctionTestData={logicFunctionTestData}
                isTesting={isExecuting}
              />
            </StyledResultContainer>
            {logicFunctionTestData.output.logs.length > 0 && (
              <StyledResultContainer>
                <LogicFunctionLogs
                  componentInstanceId={`workflow-edit-action-logs-${action.id}`}
                  value={isExecuting ? '' : logicFunctionTestData.output.logs}
                />
              </StyledResultContainer>
            )}
          </>
        ) : (
          <StyledContainer>
            {hasInputFields ? (
              <WorkflowEditActionCodeFields
                functionInput={functionInput}
                readonly={actionOptions.readonly}
                onInputChange={handleInputChange}
                VariablePicker={WorkflowVariablePicker}
                fullWidth
              />
            ) : (
              <Callout
                variant={'neutral'}
                title={t`No input fields for this action`}
                description={t`You can see the function logic in your application settings.`}
              />
            )}
          </StyledContainer>
        )}
      </WorkflowStepBody>
      {!actionOptions.readonly && (
        <WorkflowStepFooter
          stepId={action.id}
          additionalActions={
            activeTabId === TEST_TAB_ID
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
    </>
  );
};
