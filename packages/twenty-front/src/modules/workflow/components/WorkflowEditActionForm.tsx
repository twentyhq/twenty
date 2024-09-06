import { useGetManyServerlessFunctions } from '@/settings/serverless-functions/hooks/useGetManyServerlessFunctions';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { WorkflowAction } from '@/workflow/types/Workflow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconCode, isDefined } from 'twenty-ui';

const StyledTriggerHeader = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(6)};
`;

const StyledTriggerHeaderTitle = styled.p`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  font-size: ${({ theme }) => theme.font.size.xl};

  margin: ${({ theme }) => theme.spacing(3)} 0;
`;

const StyledTriggerHeaderType = styled.p`
  color: ${({ theme }) => theme.font.color.tertiary};
  margin: 0;
`;

const StyledTriggerHeaderIconContainer = styled.div`
  align-self: flex-start;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.xs};
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledTriggerSettings = styled.div`
  padding: ${({ theme }) => theme.spacing(6)};
  display: flex;
  flex-direction: column;
  row-gap: ${({ theme }) => theme.spacing(4)};
`;

export const WorkflowEditActionForm = ({
  action,
  onUpdateAction,
}: {
  action: WorkflowAction;
  onUpdateAction: (trigger: WorkflowAction) => void;
}) => {
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
    <>
      <StyledTriggerHeader>
        <StyledTriggerHeaderIconContainer>
          <IconCode color={theme.color.orange} />
        </StyledTriggerHeaderIconContainer>

        <StyledTriggerHeaderTitle>
          Code - Serverless Function
        </StyledTriggerHeaderTitle>

        <StyledTriggerHeaderType>Code</StyledTriggerHeaderType>
      </StyledTriggerHeader>

      <StyledTriggerSettings>
        <Select
          dropdownId="workflow-edit-action-function"
          label="Function"
          fullWidth
          value={action.settings.serverlessFunctionId}
          options={availableFunctions}
          onChange={(updatedFunction) => {
            onUpdateAction({
              ...action,
              settings: {
                ...action.settings,
                serverlessFunctionId: updatedFunction,
              },
            });
          }}
        />
      </StyledTriggerSettings>
    </>
  );
};
