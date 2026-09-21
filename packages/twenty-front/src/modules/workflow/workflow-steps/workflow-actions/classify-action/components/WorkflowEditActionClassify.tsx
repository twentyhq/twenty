import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
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
  JEV_MODEL_ID,
} from 'twenty-shared/ai';
import { type WorkflowClassifyQuestion } from 'twenty-shared/workflow';
import { v4 } from 'uuid';
import {
  IconStairs,
  IconPercentage,
  IconListCheck,
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

type WorkflowEditActionClassifyProps = {
  action: WorkflowClassifyAction;
  actionOptions:
    | { readonly: true }
    | {
        readonly?: false;
        onActionUpdate: (
          action: WorkflowClassifyAction,
        ) => void | Promise<unknown>;
      };
};

export const WorkflowEditActionClassify = ({
  action,
  actionOptions,
}: WorkflowEditActionClassifyProps) => {
  const { t } = useLingui();

  const buildEmptyQuestion = (): WorkflowClassifyQuestion => ({
    id: v4(),
    name: '',
    type: 'choice',
    instructions: '',
    criteria: [
      {
        id: v4(),
        name: t`Lawyer`,
        description: t`Advises clients on legal matters`,
      },
    ],
  });

  const readonly = actionOptions.readonly === true;
  const [pendingInput, setPendingInput] = useState<
    WorkflowClassifyAction['settings']['input'] | undefined
  >();
  const input = pendingInput ?? action.settings.input;
  const questions = input.questions;

  const saveAction = useDebouncedCallback(
    async (updatedInput: WorkflowClassifyAction['settings']['input']) => {
      if (actionOptions.readonly === true) {
        return;
      }

      await actionOptions.onActionUpdate({
        ...action,
        settings: { ...action.settings, input: updatedInput },
      });
      setPendingInput((currentInput) =>
        currentInput === updatedInput ? undefined : currentInput,
      );
    },
    500,
  );

  useEffect(
    () => () => {
      saveAction.flush();
    },
    [saveAction],
  );

  const questionTypeLabels: Record<AiEvaluationQuestionType, string> = {
    choice: t`Pick one option`,
    score: t`Grade on a scale`,
    boolean: t`Estimate a probability`,
  };

  const namePlaceholders: Record<AiEvaluationQuestionType, string> = {
    choice: t`profession`,
    score: t`customer_satisfaction`,
    boolean: t`would_recommend`,
  };

  const questionPlaceholders: Record<AiEvaluationQuestionType, string> = {
    choice: t`What is this person's current profession?`,
    score: t`How satisfied is the customer based on their feedback? Grade from dissatisfied to satisfied.`,
    boolean: t`Would this customer recommend the service based on their feedback?`,
  };

  const questionTypeIcons = {
    choice: IconListCheck,
    score: IconStairs,
    boolean: IconPercentage,
  };

  const aiEvaluationModels = useAtomStateValue(aiEvaluationModelsState);

  const effectiveEvaluationModel = aiEvaluationModels.find(
    (model) => model.modelId === JEV_MODEL_ID,
  );

  const questionTypeOptions = AI_EVALUATION_QUESTION_TYPES.map(
    (questionType) => ({
      label: questionTypeLabels[questionType],
      value: questionType,
      Icon: questionTypeIcons[questionType],
    }),
  );

  const updateInput = (
    inputUpdate: Partial<WorkflowClassifyAction['settings']['input']>,
  ) => {
    if (actionOptions.readonly === true) {
      return;
    }

    const updatedInput = { ...input, ...inputUpdate };
    setPendingInput(updatedInput);
    saveAction(updatedInput);
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
    const criteriaByType = {
      choice: buildEmptyQuestion().criteria,
      score: [
        {
          id: v4(),
          name: t`Dissatisfied`,
          description: t`Expresses frustration or disappointment`,
        },
      ],
      boolean: [],
    };

    // Criteria mean different things per type — named options, ordered levels,
    // nothing at all — so switching type starts them over rather than carrying
    // a list the new type would misread.
    updateQuestion(questionId, {
      type: questionType,
      criteria: criteriaByType[questionType],
    });
  };

  return (
    <>
      <WorkflowStepBody>
        <FormTextFieldInput
          label={t`Context`}
          multiline
          defaultValue={input.state}
          placeholder={
            questions.length > 0 &&
            questions.every(({ type }) => type !== 'choice')
              ? t`The customer says: "The team was helpful and resolved my issue quickly."`
              : t`Alex is a software engineer with three years of React experience.`
          }
          readonly={readonly}
          VariablePicker={WorkflowVariablePicker}
          onChange={(state) => updateInput({ state })}
        />

        {questions.map((question) => (
          <StyledQuestion key={question.id}>
            <HorizontalSeparator noMargin />

            <FormTextFieldInput
              label={t`Name`}
              hint={t`Use this name to find the answer in later workflow steps.`}
              defaultValue={question.name}
              placeholder={namePlaceholders[question.type]}
              readonly={readonly}
              onChange={(name) => updateQuestion(question.id, { name })}
              action={
                !readonly &&
                questions.length > 1 && (
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
                )
              }
            />

            <Select
              dropdownId={`workflow-classify-question-type-${question.id}`}
              label={t`Type`}
              options={questionTypeOptions}
              dropdownWidth={GenericDropdownContentWidth.Large}
              value={question.type}
              disabled={readonly}
              onChange={(questionType) =>
                handleQuestionTypeChange(question.id, questionType)
              }
            />

            <FormTextFieldInput
              label={t`Question`}
              multiline
              defaultValue={question.instructions}
              placeholder={questionPlaceholders[question.type]}
              readonly={readonly}
              VariablePicker={WorkflowVariablePicker}
              onChange={(instructions) =>
                updateQuestion(question.id, { instructions })
              }
            />

            {question.type !== 'boolean' && (
              <WorkflowClassifyQuestionCriteria
                key={question.type}
                criteria={question.criteria}
                maxCriteria={
                  question.type === 'score'
                    ? (effectiveEvaluationModel?.maxScoreLevels ?? undefined)
                    : (effectiveEvaluationModel?.maxCriteriaPerQuestion ??
                      undefined)
                }
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
          <>
            <HorizontalSeparator noMargin />
            <Button
              startIcon={<IconPlus />}
              onClick={() =>
                updateInput({
                  questions: [...questions, buildEmptyQuestion()],
                })
              }
            >
              {t`Add question`}
            </Button>
          </>
        )}
      </WorkflowStepBody>

      <WorkflowStepFooter stepId={action.id} />
    </>
  );
};
