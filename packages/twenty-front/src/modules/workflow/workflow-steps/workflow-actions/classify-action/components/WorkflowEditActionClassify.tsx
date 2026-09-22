import { aiEvaluationModelsState } from '@/client-config/states/aiEvaluationModelsState';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
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
import { useEffect, useState } from 'react';
import {
  type AiEvaluationQuestionType,
  AI_EVALUATION_QUESTION_TYPES,
  JEV_MODEL_ID,
} from 'twenty-shared/ai';
import { type WorkflowClassifyQuestion } from 'twenty-shared/workflow';
import { useDebouncedCallback } from 'use-debounce';
import { v4 } from 'uuid';
import {
  IconListCheck,
  IconPercentage,
  IconPlus,
  IconStairs,
  IconTrash,
} from 'twenty-ui/icon';
import { Button, Field } from 'twenty-ui/primitives/input';
import { HorizontalSeparator } from 'twenty-ui/primitives/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledQuestion = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledNameRow = styled.div`
  align-items: end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};

  & > :first-child {
    flex: 1;
    min-width: 0;
  }
`;

type WorkflowClassifyInput = WorkflowClassifyAction['settings']['input'];

type WorkflowEditActionClassifyProps = {
  action: WorkflowClassifyAction;
  actionOptions:
    | { readonly: true }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowClassifyAction) => void;
      };
};

const buildEmptyQuestion = (): WorkflowClassifyQuestion => ({
  id: v4(),
  name: '',
  type: 'choice',
  instructions: '',
  criteria: [],
});

export const WorkflowEditActionClassify = ({
  action,
  actionOptions,
}: WorkflowEditActionClassifyProps) => {
  const { t } = useLingui();

  const readonly = actionOptions.readonly === true;
  const [input, setInput] = useState<WorkflowClassifyInput>(
    action.settings.input,
  );
  const questions = input.questions;

  const saveAction = useDebouncedCallback(
    (updatedInput: WorkflowClassifyInput) => {
      if (actionOptions.readonly === true) {
        return;
      }

      actionOptions.onActionUpdate({
        ...action,
        settings: { ...action.settings, input: updatedInput },
      });
    },
    500,
  );

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  const questionTypeLabels: Record<AiEvaluationQuestionType, string> = {
    choice: t`Pick one option`,
    score: t`Grade on a scale`,
    boolean: t`Estimate a probability`,
  };

  const questionTypeIcons = {
    choice: IconListCheck,
    score: IconStairs,
    boolean: IconPercentage,
  };

  const namePlaceholders: Record<AiEvaluationQuestionType, string> = {
    choice: t`profession`,
    score: t`customer_satisfaction`,
    boolean: t`would_recommend`,
  };

  const questionHints: Record<AiEvaluationQuestionType, string> = {
    choice: t`For example: What is this person's current profession?`,
    score: t`For example: How satisfied is the customer based on their feedback? Grade from dissatisfied to satisfied.`,
    boolean: t`For example: Would this customer recommend the service based on their feedback?`,
  };

  const jevModel = useAtomStateValue(aiEvaluationModelsState).find(
    (model) => model.modelId === JEV_MODEL_ID,
  );

  const questionTypeOptions = AI_EVALUATION_QUESTION_TYPES.map(
    (questionType) => ({
      label: questionTypeLabels[questionType],
      value: questionType,
      Icon: questionTypeIcons[questionType],
    }),
  );

  const updateInput = (update: Partial<WorkflowClassifyInput>) => {
    if (actionOptions.readonly === true) {
      return;
    }

    const updatedInput = { ...input, ...update };

    setInput(updatedInput);
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
    updateQuestion(questionId, { type: questionType, criteria: [] });
  };

  return (
    <>
      <WorkflowStepBody>
        <FormTextFieldInput
          label={t`Context`}
          multiline
          defaultValue={input.state}
          placeholder={t`What should be classified?`}
          hint={t`For example: Alex is a software engineer with three years of React experience.`}
          readonly={readonly}
          VariablePicker={WorkflowVariablePicker}
          onChange={(state) => updateInput({ state })}
        />

        {questions.map((question) => (
          <StyledQuestion key={question.id}>
            <HorizontalSeparator noMargin />

            <FormFieldInputContainer>
              <StyledNameRow>
                <FormTextFieldInput
                  key={question.type}
                  label={t`Name`}
                  defaultValue={question.name}
                  placeholder={namePlaceholders[question.type]}
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
              </StyledNameRow>
              <Field.Description>
                {t`Use this name to find the answer in later workflow steps.`}
              </Field.Description>
            </FormFieldInputContainer>

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
              placeholder={t`What should the model decide?`}
              hint={questionHints[question.type]}
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
                    ? (jevModel?.maxScoreLevels ?? undefined)
                    : (jevModel?.maxCriteriaPerQuestion ?? undefined)
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
