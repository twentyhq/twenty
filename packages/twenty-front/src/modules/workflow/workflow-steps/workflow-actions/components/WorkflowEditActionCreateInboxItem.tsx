import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
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
  summary: string;
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
    summary: action.settings.input.summary ?? '',
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
            ...action.settings.input,
            title: nextFormData.title,
            summary: nextFormData.summary,
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

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

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
          label={t`Summary`}
          placeholder={t`A second line of context under the title`}
          defaultValue={formData.summary}
          onChange={(value) => handleFieldChange('summary', value)}
          readonly={readonly}
          VariablePicker={WorkflowVariablePicker}
        />
        <FormSelectFieldInput
          label={t`Kind of work`}
          hint={t`Decides the icon and the default routing`}
          options={typeOptions}
          defaultValue={formData.typeKey}
          onChange={(value) => handleFieldChange('typeKey', value ?? '')}
          readonly={readonly || typeOptions.length === 0}
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
