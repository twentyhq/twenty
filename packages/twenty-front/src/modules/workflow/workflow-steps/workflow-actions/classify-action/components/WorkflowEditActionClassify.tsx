import { useState } from 'react';
import { t } from '@lingui/core/macro';
import { aiClassificationInputSchema } from 'twenty-shared/ai';
import { LightButton } from 'twenty-ui/components';
import { HorizontalSeparator } from 'twenty-ui/primitives/layout';

import { aiModelsState } from '@/client-config/states/aiModelsState';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { Select } from '@/ui/input/components/Select';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type WorkflowClassifyAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowClassifyCategory } from '@/workflow/workflow-steps/workflow-actions/classify-action/components/WorkflowClassifyCategory';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';

type WorkflowEditActionClassifyProps = {
  action: WorkflowClassifyAction;
  actionOptions:
    | { readonly: true }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowClassifyAction) => void;
      };
};

export const WorkflowEditActionClassify = ({
  action,
  actionOptions,
}: WorkflowEditActionClassifyProps) => {
  const aiModels = useAtomStateValue(aiModelsState);
  const [input, setInput] = useState(action.settings.input);
  const model = aiModels.find(({ modelId }) => modelId === input.modelId);

  const updateInput = (
    update: Partial<WorkflowClassifyAction['settings']['input']>,
  ) => {
    if (actionOptions.readonly === true) {
      return;
    }

    const nextInput = { ...input, ...update };

    setInput(nextInput);
    actionOptions.onActionUpdate({
      ...action,
      valid: aiClassificationInputSchema.safeParse(nextInput).success,
      settings: { ...action.settings, input: nextInput },
    });
  };

  const updateCategory = (
    index: number,
    update: Partial<
      WorkflowClassifyAction['settings']['input']['categories'][number]
    >,
  ) => {
    updateInput({
      categories: input.categories.map((category, categoryIndex) =>
        categoryIndex === index ? { ...category, ...update } : category,
      ),
    });
  };

  return (
    <>
      <WorkflowStepBody>
        <Select
          dropdownId={`classify-model-${action.id}`}
          label={t`Model`}
          value={input.modelId}
          options={aiModels
            .filter(
              (availableModel) =>
                !availableModel.isDeprecated ||
                availableModel.modelId === input.modelId,
            )
            .map((availableModel) => ({
              value: availableModel.modelId,
              label: availableModel.label,
              contextualText:
                availableModel.kind === 'evaluation'
                  ? t`Evaluation`
                  : t`Language model`,
            }))}
          onChange={(modelId) => updateInput({ modelId })}
          disabled={actionOptions.readonly}
          withSearchInput
          description={
            model?.kind === 'evaluation'
              ? t`Returns a category and probabilities. Use conditions to route uncertain results for review.`
              : t`Returns a category. Probabilities are unavailable for language models.`
          }
        />
        <FormTextFieldInput
          label={t`Text to classify`}
          defaultValue={input.text}
          onChange={(text) => updateInput({ text })}
          multiline
          readonly={actionOptions.readonly}
          VariablePicker={WorkflowVariablePicker}
        />
        <FormTextFieldInput
          label={t`Instructions`}
          defaultValue={input.instructions}
          placeholder={t`Which team should handle this request?`}
          onChange={(instructions) => updateInput({ instructions })}
          multiline
          readonly={actionOptions.readonly}
        />
        <HorizontalSeparator noMargin />
        {input.categories.map((category, index) => (
          <WorkflowClassifyCategory
            key={index}
            index={index}
            category={category}
            readonly={actionOptions.readonly}
            onChange={(update) => updateCategory(index, update)}
            onRemove={() =>
              updateInput({
                categories: input.categories.filter(
                  (_, categoryIndex) => categoryIndex !== index,
                ),
              })
            }
          />
        ))}
        {!actionOptions.readonly && (
          <LightButton
            onClick={() =>
              updateInput({
                categories: [
                  ...input.categories,
                  { label: '', description: '' },
                ],
              })
            }
          >{t`Add category`}</LightButton>
        )}
      </WorkflowStepBody>
      <WorkflowStepFooter stepId={action.id} />
    </>
  );
};
