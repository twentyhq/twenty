import { aiEvaluationModelsState } from '@/client-config/states/aiEvaluationModelsState';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type WorkflowClassifyAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowClassifyQuestionCriteria } from '@/workflow/workflow-steps/workflow-actions/classify-action/components/WorkflowClassifyQuestionCriteria';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  type AiEvaluationQuestionType,
  AI_EVALUATION_QUESTION_TYPES,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { type WorkflowClassifyQuestion } from 'twenty-shared/workflow';
import { v4 } from 'uuid';
import {
  IconChartBar,
  IconCheckbox,
  IconCircleDot,
  IconPlus,
  IconTrash,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { HorizontalSeparator } from 'twenty-ui/primitives/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledQuestion = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledQuestionHeader = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};

  & > *:first-child {
    flex: 1;
  }
`;

type WorkflowEditActionClassifyProps = {
  action: WorkflowClassifyAction;
  actionOptions:
    | { readonly: true }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowClassifyAction) => void;
      };
};

// The settings schema requires an answer name, so a blank one makes the whole
// step unsaveable the moment a question is added. New questions get a unique
// placeholder the author can rename.
const buildEmptyQuestion = (
  existingQuestions: WorkflowClassifyQuestion[],
): WorkflowClassifyQuestion => {
  const takenNames = new Set(existingQuestions.map(({ name }) => name));

  let suffix = existingQuestions.length + 1;

  while (takenNames.has(`question_${suffix}`)) {
    suffix += 1;
  }

  return {
    id: v4(),
    name: `question_${suffix}`,
    type: 'choice',
    instructions: '',
    criteria: [],
  };
};

export const WorkflowEditActionClassify = ({
  action,
  actionOptions,
}: WorkflowEditActionClassifyProps) => {
  const { t } = useLingui();

  const readonly = actionOptions.readonly === true;
  const questions = action.settings.input.questions;

  const questionTypeLabels: Record<AiEvaluationQuestionType, string> = {
    choice: t`Pick one option`,
    score: t`Grade on a scale`,
    boolean: t`Estimate a probability`,
  };

  const questionTypeIcons = {
    choice: IconCircleDot,
    score: IconChartBar,
    boolean: IconCheckbox,
  };

  const aiEvaluationModels = useAtomStateValue(aiEvaluationModelsState);

  const selectedModelId = action.settings.input.modelId;

  // The workspace default is the point of the node: a workflow built before an
  // evaluation provider existed starts using one the moment it is configured,
  // with no edit. Naming a model pins that choice instead.
  const modelOptions = [
    {
      label: t`Workspace default`,
      value: '',
    },
    ...evaluationModels
      .filter(
        (evaluationModel) =>
          evaluationModel.isDeprecated !== true ||
          evaluationModel.modelId === selectedModelId,
      )
      .map((evaluationModel) => ({
        label: evaluationModel.label,
        value: evaluationModel.modelId,
      })),
  ];

  const selectedModel = evaluationModels.find(
    (evaluationModel) => evaluationModel.modelId === selectedModelId,
  );

  const modelDescription = !isDefined(selectedModel)
    ? t`Runs on the workspace's evaluation model, or its language model when none is configured. Probabilities are only returned by an evaluation model.`
    : selectedModel.isAvailable
      ? t`Returns a calibrated probability for every answer.`
      : t`This model is in the catalog but its provider is not configured, so runs fall back to the workspace default.`;

  const questionTypeOptions = AI_EVALUATION_QUESTION_TYPES.map(
    (questionType) => ({
      label: questionTypeLabels[questionType],
      value: questionType,
      Icon: questionTypeIcons[questionType],
    }),
  );

  const updateInput = (
    input: Partial<WorkflowClassifyAction['settings']['input']>,
  ) => {
    if (actionOptions.readonly === true) {
      return;
    }

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: { ...action.settings.input, ...input },
      },
    });
  };

  const updateQuestion = (
    questionId: string,
    update: Partial<WorkflowClassifyQuestion>,
  ) => {
    updateInput({
      questions: questions.map((question) =>
        question.id === questionId ? { ...question, ...update } : question,
      ),
    });
  };

  const handleQuestionTypeChange = (
    questionId: string,
    questionType: AiEvaluationQuestionType,
  ) => {
    // Criteria mean different things per type — named options, ordered levels,
    // nothing at all — so switching type starts them over rather than carrying
    // a list the new type would misread.
    updateQuestion(questionId, { type: questionType, criteria: [] });
  };

  return (
    <>
      <WorkflowStepBody>
        <Select
          dropdownId={`classify-model-${action.id}`}
          label={t`Model`}
          value={selectedModelId ?? ''}
          options={modelOptions}
          onChange={(modelId) =>
            updateInput({ modelId: modelId === '' ? undefined : modelId })
          }
          disabled={actionOptions.readonly}
          description={modelDescription}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        />
        <FormTextFieldInput
          label={t`State`}
          multiline
          defaultValue={action.settings.input.state}
          placeholder={t`What the model should read, such as {{trigger.record.notes}}`}
          readonly={readonly}
          VariablePicker={WorkflowVariablePicker}
          onChange={(state) => updateInput({ state })}
        />

        {questions.map((question) => (
          <StyledQuestion key={question.id}>
            <HorizontalSeparator noMargin />

            <StyledQuestionHeader>
              <FormTextFieldInput
                label={t`Answer name`}
                defaultValue={question.name}
                placeholder={t`category`}
                readonly={readonly}
                onChange={(name) => updateQuestion(question.id, { name })}
              />
              {!readonly && questions.length > 1 && (
                <Button
                  startIcon={<IconTrash />}
                  aria-label={t`Delete`}
                  onClick={() =>
                    updateInput({
                      questions: questions.filter(
                        (candidate) => candidate.id !== question.id,
                      ),
                    })
                  }
                />
              )}
            </StyledQuestionHeader>

            <Select
              dropdownId={`workflow-classify-question-type-${question.id}`}
              label={t`Decision`}
              options={questionTypeOptions}
              dropdownWidth={GenericDropdownContentWidth.Large}
              value={question.type}
              disabled={readonly}
              onChange={(questionType) =>
                handleQuestionTypeChange(question.id, questionType)
              }
            />

            <FormTextFieldInput
              label={t`Instructions`}
              multiline
              defaultValue={question.instructions}
              placeholder={t`What should the model decide?`}
              readonly={readonly}
              VariablePicker={WorkflowVariablePicker}
              onChange={(instructions) =>
                updateQuestion(question.id, { instructions })
              }
            />

            {question.type !== 'boolean' && (
              <WorkflowClassifyQuestionCriteria
                criteria={question.criteria}
                variant={question.type === 'choice' ? 'options' : 'levels'}
                readonly={readonly}
                onChange={(criteria) =>
                  updateQuestion(question.id, { criteria })
                }
              />
            )}
          </StyledQuestion>
        ))}

        {!readonly && (
          <Button
            startIcon={<IconPlus />}
            onClick={() =>
              updateInput({
                questions: [...questions, buildEmptyQuestion(questions)],
              })
            }
          >
            {t`Add question`}
          </Button>
        )}
      </WorkflowStepBody>

      <WorkflowStepFooter stepId={action.id} />
    </>
  );
};
