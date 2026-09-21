import { useNavigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { aiModelTiersState } from '@/client-config/states/aiModelTiersState';
import { isNonEmptyString } from '@sniptt/guards';
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
  DEFAULT_AI_AGENT_MODEL_TIER,
} from 'twenty-shared/ai';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
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
  column-gap: ${themeCssVariables.spacing[2]};
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;

  & > *:first-child {
    display: grid;
    grid-column: 1;
    grid-row: 1 / 4;
    grid-template-rows: subgrid;
  }

  & > button {
    align-self: center;
    grid-column: 2;
    grid-row: 2;
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
  const navigate = useNavigate();

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

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const aiModels = useAtomStateValue(aiModelsState);
  const aiModelTiers = useAtomStateValue(aiModelTiersState);
  const selectedModelId = action.settings.input.modelId;
  const defaultEvaluationModel =
    aiEvaluationModels.find(
      (model) =>
        model.modelId === currentWorkspace?.aiEvaluationModelId &&
        model.isAvailable,
    ) ??
    aiEvaluationModels.find(
      (model) => model.isAvailable && !model.isDeprecated,
    );
  const defaultLanguageModel = aiModels.find(
    (model) =>
      model.modelId ===
      aiModelTiers.find((tier) => tier.tier === DEFAULT_AI_AGENT_MODEL_TIER)
        ?.modelId,
  );
  const effectiveEvaluationModel = isNonEmptyString(selectedModelId)
    ? aiEvaluationModels.find((model) => model.modelId === selectedModelId)
    : defaultEvaluationModel;
  const effectiveLanguageModel = isNonEmptyString(selectedModelId)
    ? aiModels.find((model) => model.modelId === selectedModelId)
    : defaultLanguageModel;
  const needsModelChoice =
    !isDefined(effectiveEvaluationModel) &&
    !isNonEmptyString(selectedModelId) &&
    action.settings.input.allowLanguageModelFallback === false;

  const modelOptions = [
    {
      label:
        (isDefined(defaultEvaluationModel)
          ? t`${defaultEvaluationModel.label} (workspace setting)`
          : undefined) ??
        (action.settings.input.allowLanguageModelFallback === false
          ? t`Choose a model`
          : (defaultLanguageModel?.label ?? t`Language model`)),
      contextualText: t`Follows classification settings`,
      value: '',
    },
    ...aiEvaluationModels
      .filter(
        (model) => !model.isDeprecated || model.modelId === selectedModelId,
      )
      .map((model) => ({
        label: model.label,
        value: model.modelId,
        disabled: !model.isAvailable,
        contextualText: model.isAvailable
          ? t`Use this model`
          : t`Provider is not configured`,
      })),
    ...aiModels
      .filter(
        (model) => !model.isDeprecated || model.modelId === selectedModelId,
      )
      .map((model) => ({
        label: model.label,
        value: model.modelId,
        contextualText: t`Language model · No probabilities`,
      })),
  ];

  if (
    isNonEmptyString(selectedModelId) &&
    !modelOptions.some((option) => option.value === selectedModelId)
  ) {
    modelOptions.push({
      label: selectedModelId,
      value: selectedModelId,
      contextualText: t`Model unavailable`,
    });
  }

  const probabilityAvailable =
    effectiveEvaluationModel?.isAvailable === true &&
    effectiveEvaluationModel.supportedQuestionTypes.includes('boolean');
  const getModelDescription = () => {
    if (needsModelChoice)
      return t`Choose a language model to continue without probabilities, or configure an evaluation model in Settings → AI → Classification.`;
    if (isDefined(effectiveEvaluationModel)) {
      return effectiveEvaluationModel.isAvailable
        ? t`Returns probabilities for each answer.`
        : t`This provider is not configured. Configure it in Settings → AI before running this step.`;
    }
    if (!isDefined(effectiveLanguageModel))
      return t`Model unavailable. Choose another model or configure a provider in Settings → AI.`;
    return t`Categories and scores are available. Probabilities are not available. Usage is billed at this language model's rates.`;
  };

  const questionTypeOptions = AI_EVALUATION_QUESTION_TYPES.map(
    (questionType) => ({
      label: questionTypeLabels[questionType],
      value: questionType,
      Icon: questionTypeIcons[questionType],
      disabled: questionType === 'boolean' && !probabilityAvailable,
      contextualText:
        questionType === 'boolean' && !probabilityAvailable
          ? t`Requires an evaluation model such as Jev`
          : undefined,
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
          withSearchInput
          callToActionButton={
            readonly
              ? undefined
              : {
                  text: t`Configure classification models`,
                  onClick: () =>
                    navigate(
                      getSettingsPath(
                        SettingsPath.AI,
                        undefined,
                        undefined,
                        'models',
                      ),
                    ),
                }
          }
          onChange={(modelId) =>
            updateInput({
              modelId: modelId === '' ? undefined : modelId,
              allowLanguageModelFallback:
                modelId === ''
                  ? false
                  : action.settings.input.allowLanguageModelFallback,
            })
          }
          disabled={actionOptions.readonly}
          description={getModelDescription()}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        />
        <FormTextFieldInput
          label={t`Context`}
          multiline
          defaultValue={action.settings.input.state}
          placeholder={t`e.g. Alex is a software engineer with five years of experience, including three years using React and TypeScript.`}
          readonly={readonly}
          VariablePicker={WorkflowVariablePicker}
          onChange={(state) => updateInput({ state })}
        />

        {questions.map((question) => (
          <StyledQuestion key={question.id}>
            <HorizontalSeparator noMargin />

            <StyledQuestionHeader>
              <FormTextFieldInput
                label={t`Result name`}
                hint={t`Use this name to find the answer in later workflow steps.`}
                defaultValue={question.name}
                placeholder={
                  question.type === 'choice'
                    ? t`e.g. profession`
                    : question.type === 'score'
                      ? t`e.g. react_experience`
                      : t`e.g. uses_react`
                }
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
              label={t`Response type`}
              options={questionTypeOptions}
              dropdownWidth={GenericDropdownContentWidth.Large}
              value={question.type}
              disabled={readonly}
              description={
                question.type === 'boolean' && !probabilityAvailable
                  ? t`This question requires a compatible evaluation model. Choose one before running this step.`
                  : undefined
              }
              onChange={(questionType) =>
                handleQuestionTypeChange(question.id, questionType)
              }
            />

            <FormTextFieldInput
              label={t`Question`}
              multiline
              defaultValue={question.instructions}
              placeholder={
                question.type === 'choice'
                  ? t`e.g. What is this person's current profession, based on the profile?`
                  : question.type === 'score'
                    ? t`e.g. Assess the React experience described in this profile. Use the highest level whose requirements are met.`
                    : t`e.g. Does this person have professional experience using React?`
              }
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
                    ? (effectiveEvaluationModel?.maxScoreLevels ?? 10)
                    : (effectiveEvaluationModel?.maxCriteriaPerQuestion ?? 255)
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
