import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';

import {
  type BaseOutputSchemaV2,
  type Node,
  type WorkflowClassifyQuestion,
} from 'twenty-shared/workflow';

const buildProbabilitiesNode = (keys: string[]): Node => ({
  isLeaf: false,
  type: 'object',
  label: t`Probabilities`,
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
      label: t`Type`,
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
          label: t`Choice`,
          value: question.criteria[0]?.name ?? '',
        },
        probabilities: buildProbabilitiesNode(
          question.criteria
            .filter((criterion) => isNonEmptyString(criterion.name))
            .map((criterion) => criterion.name),
        ),
      };
    case 'score':
      return {
        ...commonFields,
        score: {
          isLeaf: true,
          type: 'number',
          label: t`Score`,
          value: 0,
        },
        // Native scores carry a distribution over level indices, advertised like a choice's
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
          label: t`Probability of true`,
          value: 0,
        },
      };
  }
};

// Keyed by question name, so downstream steps read {{stepId.answers.<name>.choice}} whatever model answered
export const generateClassifyOutputSchema = (
  questions: WorkflowClassifyQuestion[],
): BaseOutputSchemaV2 => ({
  answers: {
    isLeaf: false,
    type: 'object',
    label: t`Answers`,
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
    label: t`Model`,
    value: '',
  },
});
