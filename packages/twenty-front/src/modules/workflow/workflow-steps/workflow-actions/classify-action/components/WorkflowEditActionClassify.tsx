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

  & > :only-child {
    grid-column: 1 / -1;
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
  criteria: [
    {
      id: v4(),
      name: 'Lawyer',
      description: 'Advises clients on legal matters',
    },
  ],
});

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
    choice: IconListCheck,
    score: IconStairs,
    boolean: IconPercentage,
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
          ? t`${defaultEvaluationModel.label} (default)`
          : undefined) ??
        (action.settings.input.allowLanguageModelFallback === false
          ? t`Choose a model`
          : (defaultLanguageModel?.label ?? t`Language model`)),
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
          ? undefined
          : t`Not configured`,
      })),
    ...aiModels
      .filter(
        (model) => !model.isDeprecated || model.modelId === selectedModelId,
      )
      .map((model) => ({
        label: model.label,
        value: model.modelId,
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
      return t`Choose a model to continue.`;
    if (isDefined(effectiveEvaluationModel)) {
      return effectiveEvaluationModel.isAvailable
        ? undefined
        : t`Configure this provider in Settings → AI.`;
    }
    if (!isDefined(effectiveLanguageModel))
      return t`Model unavailable. Choose another model.`;
    return t`Probabilities unavailable with this model.`;
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
    updateQuestion(questionId, {
      type: questionType,
      criteria:
        questionType === 'score'
          ? [
              {
                id: v4(),
                name: t`Dissatisfied`,
                description: t`Expresses frustration or disappointment`,
              },
            ]
          : questionType === 'choice'
            ? buildEmptyQuestion().criteria
            : [],
    });
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
                  text: t`Model settings`,
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

            <StyledQuestionHeader>
              <FormTextFieldInput
                label={t`Name`}
                hint={t`Use this name to find the answer in later workflow steps.`}
                defaultValue={question.name}
                placeholder={
                  question.type === 'choice'
                    ? t`profession`
                    : question.type === 'score'
                      ? t`customer_satisfaction`
                      : t`would_recommend`
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
              label={t`Type`}
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
                  ? t`What is this person's current profession?`
                  : question.type === 'score'
                    ? t`How satisfied is the customer based on their feedback? Grade from dissatisfied to satisfied.`
                    : t`Would this customer recommend the service based on their feedback?`
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
