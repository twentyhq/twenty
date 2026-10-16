import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { Select } from '@/ui/input/components/Select';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useLingui } from '@lingui/react/macro';
import {
  type WorkflowConversation,
  type WorkflowConversationScope,
} from 'twenty-shared/workflow';
import { doNotTranslate } from 'twenty-shared/i18n';

type WorkflowConversationFieldsProps = {
  dropdownId: string;
  conversation: WorkflowConversation | undefined;
  defaultScope: WorkflowConversationScope;
  description?: string;
  readonly?: boolean;
  onChange: (conversation: WorkflowConversation) => void;
};

export const WorkflowConversationFields = ({
  dropdownId,
  conversation,
  defaultScope,
  description,
  readonly,
  onChange,
}: WorkflowConversationFieldsProps) => {
  const { t } = useLingui();
  const scope = conversation?.scope ?? defaultScope;

  const scopeOptions: { label: string; value: WorkflowConversationScope }[] = [
    { label: t`One per run`, value: doNotTranslate('RUN') },
    { label: t`A new one each time the step runs`, value: 'STEP' },
    { label: t`Shared by key, across runs`, value: doNotTranslate('KEY') },
  ];

  const handleScopeChange = (nextScope: WorkflowConversationScope) => {
    onChange(
      nextScope === 'KEY'
        ? { scope: nextScope, key: conversation?.key ?? '' }
        : { scope: nextScope },
    );
  };

  return (
    <>
      <Select
        dropdownId={dropdownId}
        label={t`Conversation`}
        description={
          description ??
          t`Which conversation with the recipient this step writes to`
        }
        fullWidth
        disabled={readonly}
        value={scope}
        options={scopeOptions}
        onChange={handleScopeChange}
      />
      {scope === 'KEY' && (
        <FormTextFieldInput
          label={t`Conversation key`}
          placeholder={t`Steps of this workflow sharing a key write to the same conversation`}
          readonly={readonly}
          defaultValue={conversation?.key}
          onChange={(key) => {
            onChange({ scope: doNotTranslate('KEY'), key });
          }}
          VariablePicker={WorkflowVariablePicker}
        />
      )}
    </>
  );
};
