import { getFunctionInputFromInputSchema } from 'twenty-shared/workflow';
import { mergeDefaultFunctionInputAndFunctionInput } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/mergeDefaultFunctionInputAndFunctionInput';
import { useGetOneLogicFunction } from '@/logic-functions/hooks/useGetOneLogicFunction';
import { type WorkflowLogicFunctionAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowEditActionCodeFields } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowEditActionCodeFields';
import { setNestedValue } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/setNestedValue';
import { WorkflowMessage } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowMessage';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { isObject } from '@sniptt/guards';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
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

  const functionInput = useMemo(() => {
    const toolInputSchema = logicFunction?.toolInputSchema;

    if (!isDefined(toolInputSchema)) {
      return action.settings.input.logicFunctionInput ?? {};
    }

    const schemaArray = Array.isArray(toolInputSchema)
      ? toolInputSchema
      : [toolInputSchema];

    const defaultInput = getFunctionInputFromInputSchema(schemaArray)[0];

    if (!isObject(defaultInput)) {
      return action.settings.input.logicFunctionInput ?? {};
    }

    return mergeDefaultFunctionInputAndFunctionInput({
      newInput: defaultInput,
      oldInput: action.settings.input.logicFunctionInput ?? {},
    });
  }, [
    logicFunction?.toolInputSchema,
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

  if (loading) {
    return null;
  }

  const hasInputFields = Object.keys(functionInput).length > 0;

  return (
    <>
      <WorkflowStepBody>
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
            <WorkflowMessage
              title={t`No input fields for this action`}
              description={t`You can see the function logic in your application settings.`}
            />
          )}
        </StyledContainer>
      </WorkflowStepBody>
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};
