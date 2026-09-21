import { isVariableReference } from 'twenty-shared/utils';
import { isNonEmptyString } from '@sniptt/guards';

import {
  type BaseOutputSchemaV2,
  type Node,
  type WorkflowClassifyQuestion,
} from 'twenty-shared/workflow';

const buildProbabilitiesNode = (keys: string[]): Node => ({
  isLeaf: false,
  type: 'object',
  label: 'Probabilities',
  value: Object.fromEntries(
    keys.map((key) => [
      key,
      {
        isLeaf: true as const,
        type: 'number' as const,
        label: key,
        value: 0,
      },
    ]),
  ),
});

const buildAnswerSchema = (
  question: WorkflowClassifyQuestion,
): BaseOutputSchemaV2 => {
  const commonFields: BaseOutputSchemaV2 = {
    type: {
      isLeaf: true,
      type: 'string',
      label: 'Type',
      value: question.type,
    },
  };

  switch (question.type) {
    case 'choice':
      return {
        ...commonFields,
        choice: {
          isLeaf: true,
          type: 'string',
          label: 'Choice',
          value: question.criteria[0]?.name ?? '',
        },
        probabilities: buildProbabilitiesNode(
          question.criteria
            // Dynamic labels are only known at runtime, so they cannot provide
            // stable probability paths in the variable picker.
            .filter(
              (criterion) =>
                isNonEmptyString(criterion.name) &&
                !isVariableReference(criterion.name),
            )
            .map((criterion) => criterion.name),
        ),
      };
    case 'score':
      return {
        ...commonFields,
        score: {
          isLeaf: true,
          type: 'number',
          label: 'Score',
          value: 0,
        },
        // Native scores carry a distribution over level indices, so the picker
        // advertises it the same way it does for a choice.
        probabilities: buildProbabilitiesNode(
          question.criteria.map((_, level) => String(level)),
        ),
      };
    case 'boolean':
      return {
        ...commonFields,
        probability: {
          isLeaf: true,
          type: 'number',
          label: 'Probability of true',
          value: 0,
        },
      };
  }
};

// Answers are keyed by the question's name, so a downstream step reads
// {{stepId.answers.<name>.choice}} whatever model answered.
export const generateClassifyOutputSchema = (
  questions: WorkflowClassifyQuestion[],
): BaseOutputSchemaV2 => ({
  answers: {
    isLeaf: false,
    type: 'object',
    label: 'Answers',
    value: Object.fromEntries(
      questions
        .filter((question) => isNonEmptyString(question.name))
        .map((question) => [
          question.name,
          {
            isLeaf: false as const,
            type: 'object' as const,
            label: question.name,
            value: buildAnswerSchema(question),
          },
        ]),
    ),
  },
  modelId: {
    isLeaf: true,
    type: 'string',
    label: 'Model',
    value: '',
  },
  runnerKind: {
    isLeaf: true,
    type: 'string',
    label: 'Answered by',
    value: 'evaluation-model',
  },
});
