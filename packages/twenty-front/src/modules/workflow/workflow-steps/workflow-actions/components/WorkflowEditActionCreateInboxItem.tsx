import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { type JsonValue } from 'type-fest';
import { type SelectOption } from 'twenty-ui/input';
import { useDebouncedCallback } from 'use-debounce';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { useInboxSettings } from '@/settings/inbox/hooks/useInboxSettings';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type WorkflowCreateInboxItemAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';

type CreateInboxItemFormData = {
  title: string;
  preview: string;
  typeKey: string;
  queueId: string;
  assigneeWorkspaceMemberId: string;
};

type WorkflowEditActionCreateInboxItemProps = {
  action: WorkflowCreateInboxItemAction;
  actionOptions:
    | { readonly: true }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowCreateInboxItemAction) => void;
      };
};

// Conditions live in the steps above this one: an If/Else deciding who gets the
// approval is the same rule a rule builder would express, minus the builder.
export const WorkflowEditActionCreateInboxItem = ({
  action,
  actionOptions,
}: WorkflowEditActionCreateInboxItemProps) => {
  const readonly = actionOptions.readonly === true;
  const { inboxQueues, inboxItemTypes } = useInboxSettings();
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  const [formData, setFormData] = useState<CreateInboxItemFormData>(() => ({
    title: action.settings.input.title,
    preview: action.settings.input.preview ?? '',
    typeKey: action.settings.input.typeKey,
    queueId: action.settings.input.queueId ?? '',
    assigneeWorkspaceMemberId:
      action.settings.input.assigneeWorkspaceMemberId ?? '',
  }));

  const saveAction = useDebouncedCallback(
    (nextFormData: CreateInboxItemFormData) => {
      if (readonly) {
        return;
      }

      actionOptions.onActionUpdate?.({
        ...action,
        settings: {
          ...action.settings,
          input: {
            title: nextFormData.title,
            preview: nextFormData.preview,
            typeKey: nextFormData.typeKey,
            queueId: nextFormData.queueId || undefined,
            assigneeWorkspaceMemberId:
              nextFormData.assigneeWorkspaceMemberId || undefined,
          },
        },
      });
    },
    1_000,
  );

  const handleFieldChange = (
    fieldName: keyof CreateInboxItemFormData,
    updatedValue: JsonValue,
  ) => {
    const nextFormData = { ...formData, [fieldName]: updatedValue };

    setFormData(nextFormData);
    saveAction(nextFormData);
  };

  const typeOptions: SelectOption[] = inboxItemTypes.map((inboxItemType) => ({
    label: inboxItemType.label,
    value: inboxItemType.key,
  }));

  const queueOptions: SelectOption[] = inboxQueues.map((inboxQueue) => ({
    label: inboxQueue.name,
    value: inboxQueue.id,
  }));

  const workspaceMemberOptions: SelectOption[] = currentWorkspaceMembers.map(
    (workspaceMember) => ({
      label:
        `${workspaceMember.name.firstName ?? ''} ${workspaceMember.name.lastName ?? ''}`.trim(),
      value: workspaceMember.id,
    }),
  );

  return (
    <>
      <WorkflowStepBody>
        <FormTextFieldInput
          label={t`Title`}
          placeholder={t`What the item says in the inbox`}
          defaultValue={formData.title}
          onChange={(value) => handleFieldChange('title', value)}
          readonly={readonly}
          VariablePicker={WorkflowVariablePicker}
        />
        <FormTextFieldInput
          label={t`Preview`}
          placeholder={t`A second line of context`}
          defaultValue={formData.preview}
          onChange={(value) => handleFieldChange('preview', value)}
          readonly={readonly}
          VariablePicker={WorkflowVariablePicker}
        />
        <FormSelectFieldInput
          label={t`Kind of work`}
          hint={t`Decides the actions offered on the item`}
          options={typeOptions}
          defaultValue={formData.typeKey}
          onChange={(value) => handleFieldChange('typeKey', value ?? '')}
          readonly={readonly}
        />
        <FormSelectFieldInput
          label={t`Assignee`}
          hint={t`Leave empty to route by the workspace settings`}
          options={workspaceMemberOptions}
          defaultValue={formData.assigneeWorkspaceMemberId}
          onChange={(value) =>
            handleFieldChange('assigneeWorkspaceMemberId', value ?? '')
          }
          readonly={readonly}
          isNullable
          VariablePicker={WorkflowVariablePicker}
        />
        <FormSelectFieldInput
          label={t`Shared inbox`}
          hint={t`Used when no assignee is named`}
          options={queueOptions}
          defaultValue={formData.queueId}
          onChange={(value) => handleFieldChange('queueId', value ?? '')}
          readonly={readonly}
          isNullable
        />
      </WorkflowStepBody>
      {!readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};
