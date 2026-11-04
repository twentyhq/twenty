import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useGetLogicFunctionSourceCode } from '@/logic-functions/hooks/useGetLogicFunctionSourceCode';
import { type WorkflowCodeAction } from '@/workflow/types/Workflow';

import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowEditActionCodeFields } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowEditActionCodeFields';
import { WorkflowCodeStepInputSchemaEffect } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowCodeStepInputSchemaEffect';
import { codeStepInputSchemaFamilyState } from '@/workflow/workflow-steps/workflow-actions/code-action/states/codeStepInputSchemaFamilyState';
import { getWrongExportedFunctionMarkers } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/getWrongExportedFunctionMarkers';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { CodeEditor } from 'twenty-ui/components/code-editor';

const StyledCodeEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

type WorkflowReadonlyActionCodeProps = {
  action: WorkflowCodeAction;
};

export const WorkflowReadonlyActionCode = ({
  action,
}: WorkflowReadonlyActionCodeProps) => {
  const legacyLogicFunctionId = isDefined(action.settings.input.code)
    ? undefined
    : action.settings.input.logicFunctionId;

  const { sourceHandlerCode: legacySourceCode, loading } =
    useGetLogicFunctionSourceCode({
      logicFunctionId: legacyLogicFunctionId ?? '',
    });

  const code = action.settings.input.code ?? legacySourceCode ?? undefined;

  const codeStepInputSchema = useAtomFamilyStateValue(
    codeStepInputSchemaFamilyState,
    action.id,
  );

  return (
    <>
      <WorkflowCodeStepInputSchemaEffect stepId={action.id} sourceCode={code} />
      {!loading && (
        <WorkflowStepBody>
          <WorkflowEditActionCodeFields
            functionInput={action.settings.input.logicFunctionInput}
            inputSchema={codeStepInputSchema}
            readonly
          />
          <StyledCodeEditorContainer>
            <CodeEditor
              height={343}
              value={code}
              language="typescript"
              setMarkers={getWrongExportedFunctionMarkers}
              options={{
                readOnly: true,
                domReadOnly: true,
              }}
            />
          </StyledCodeEditorContainer>
        </WorkflowStepBody>
      )}
    </>
  );
};
