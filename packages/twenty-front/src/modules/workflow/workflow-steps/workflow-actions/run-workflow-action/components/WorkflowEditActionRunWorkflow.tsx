import { FormRawJsonFieldInput } from '@/object-record/record-field/ui/form-types/components/FormRawJsonFieldInput';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { type WorkflowRunWorkflowAction } from '@/workflow/types/Workflow';
import { parseAndValidateVariableFriendlyStringifiedJson } from '@/workflow/utils/parseAndValidateVariableFriendlyStringifiedJson';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { useRunWorkflowActionWorkflowOptions } from '@/workflow/workflow-steps/workflow-actions/run-workflow-action/hooks/useRunWorkflowActionWorkflowOptions';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Callout } from 'twenty-ui/feedback';
import { IconAlertTriangle } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type WorkflowEditActionRunWorkflowProps = {
  action: WorkflowRunWorkflowAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowRunWorkflowAction) => void;
      };
};

const StyledCalloutContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[4]};
  padding-left: ${themeCssVariables.spacing[7]};
  padding-right: ${themeCssVariables.spacing[7]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

export const WorkflowEditActionRunWorkflow = ({
  action,
  actionOptions,
}: WorkflowEditActionRunWorkflowProps) => {
  const { workflowOptions, getWorkflowHasNoActiveVersion } =
    useRunWorkflowActionWorkflowOptions();

  const [inputJsonString, setInputJsonString] = useState<string | null>(
    JSON.stringify(action.settings.input.input ?? {}, null, 2),
  );
  const [inputJsonError, setInputJsonError] = useState<string | undefined>();

  const handleWorkflowChange = (newWorkflowId: string) => {
    if (actionOptions.readonly === true) {
      return;
    }

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          ...action.settings.input,
          workflowId: newWorkflowId,
        },
      },
    });
  };

  const saveInput = useDebouncedCallback((input: Record<string, unknown>) => {
    if (actionOptions.readonly === true) {
      return;
    }

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          ...action.settings.input,
          input,
        },
      },
    });
  }, 500);

  useEffect(() => {
    return () => {
      saveInput.flush();
    };
  }, [saveInput]);

  const handleInputJsonChange = (value: string | null) => {
    if (actionOptions.readonly === true) {
      return;
    }

    setInputJsonString(value);

    const parsingResult = parseAndValidateVariableFriendlyStringifiedJson(
      isNonEmptyString(value) ? value : '{}',
    );

    if (!parsingResult.isValid) {
      setInputJsonError(parsingResult.error);
      return;
    }

    setInputJsonError(undefined);

    saveInput(parsingResult.data);
  };

  const selectedWorkflowId = action.settings.input.workflowId;
  const shouldShowNoActiveVersionWarning =
    isDefined(selectedWorkflowId) &&
    selectedWorkflowId !== '' &&
    getWorkflowHasNoActiveVersion(selectedWorkflowId);

  return (
    <>
      <WorkflowStepBody>
        <Select
          dropdownId="workflow-edit-action-run-workflow-picker"
          label={t`Workflow`}
          options={workflowOptions}
          withSearchInput
          dropdownWidth={GenericDropdownContentWidth.Large}
          value={selectedWorkflowId}
          onChange={handleWorkflowChange}
          disabled={actionOptions.readonly}
          emptyOption={{
            label: t`Select a workflow`,
            value: '',
          }}
        />

        {shouldShowNoActiveVersionWarning && (
          <StyledCalloutContainer>
            <Callout
              variant="warning"
              Icon={IconAlertTriangle}
              title={t`This workflow has no active version`}
              description={t`This step will fail at run time until a version of the selected workflow is published. You can still save this configuration now.`}
            />
          </StyledCalloutContainer>
        )}

        <FormRawJsonFieldInput
          label={t`Input`}
          defaultValue={inputJsonString}
          onChange={handleInputJsonChange}
          readonly={actionOptions.readonly}
          error={inputJsonError}
          VariablePicker={WorkflowVariablePicker}
        />
      </WorkflowStepBody>

      <WorkflowStepFooter stepId={action.id} />
    </>
  );
};
