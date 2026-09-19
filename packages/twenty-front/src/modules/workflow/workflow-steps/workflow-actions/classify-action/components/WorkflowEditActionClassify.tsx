import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
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
              updateInput({ questions: [...questions, buildEmptyQuestion()] })
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
