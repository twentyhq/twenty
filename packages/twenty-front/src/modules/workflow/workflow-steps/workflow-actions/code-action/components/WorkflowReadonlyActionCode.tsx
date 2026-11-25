import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { type WorkflowCodeAction } from '@/workflow/types/Workflow';

import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowEditActionCodeFields } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowEditActionCodeFields';
import { WorkflowCodeStepInputSchemaEffect } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowCodeStepInputSchemaEffect';
import { codeStepInputSchemaFamilyState } from '@/workflow/workflow-steps/workflow-actions/code-action/states/codeStepInputSchemaFamilyState';
import { getWrongExportedFunctionMarkers } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/getWrongExportedFunctionMarkers';
import { styled } from '@linaria/react';
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
  const code = action.settings.input.code;

  const codeStepInputSchema = useAtomFamilyStateValue(
    codeStepInputSchemaFamilyState,
    action.id,
  );

  return (
    <>
      <WorkflowCodeStepInputSchemaEffect stepId={action.id} sourceCode={code} />
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
    </>
  );
};
