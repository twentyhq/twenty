import { useGetManyServerlessFunctions } from '@/settings/serverless-functions/hooks/useGetManyServerlessFunctions';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { WorkflowEditActionFormBase } from '@/workflow/components/WorkflowEditActionFormBase';
import { WorkflowCodeStep } from '@/workflow/types/Workflow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconCode, isDefined } from 'twenty-ui';

const StyledTriggerSettings = styled.div`
  padding: ${({ theme }) => theme.spacing(6)};
  display: flex;
  flex-direction: column;
  row-gap: ${({ theme }) => theme.spacing(4)};
`;

type WorkflowEditActionFormServerlessFunctionProps =
  | {
      action: WorkflowCodeStep;
      readonly: true;
    }
  | {
      action: WorkflowCodeStep;
      readonly?: false;
      onActionUpdate: (action: WorkflowCodeStep) => void;
    };

export const WorkflowEditActionFormServerlessFunction = (
  props: WorkflowEditActionFormServerlessFunctionProps,
) => {
  const theme = useTheme();

  const { serverlessFunctions } = useGetManyServerlessFunctions();

  const availableFunctions: Array<SelectOption<string>> = [
    { label: 'None', value: '' },
    ...serverlessFunctions
      .filter((serverlessFunction) =>
        isDefined(serverlessFunction.latestVersion),
      )
      .map((serverlessFunction) => ({
        label: serverlessFunction.name,
        value: serverlessFunction.id,
      })),
  ];

  return (
    <WorkflowEditActionFormBase
      ActionIcon={<IconCode color={theme.color.orange} />}
      actionTitle="Code - Serverless Function"
      actionType="Code"
    >
      <StyledTriggerSettings>
        <Select
          dropdownId="workflow-edit-action-function"
          label="Function"
          fullWidth
          value={props.action.settings.input.serverlessFunctionId}
          options={availableFunctions}
          disabled={props.readonly}
          onChange={(updatedFunction) => {
            if (props.readonly === true) {
              return;
            }

            props.onActionUpdate({
              ...props.action,
              settings: {
                ...props.action.settings,
                input: {
                  serverlessFunctionId: updatedFunction,
                },
              },
            });
          }}
        />
      </StyledTriggerSettings>
    </WorkflowEditActionFormBase>
  );
};
