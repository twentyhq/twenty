import {
  type BaseOutputSchemaV2,
  type Node,
  type WorkflowClassifyQuestion,
} from 'twenty-shared/workflow';

// Only an evaluation model returns a distribution; the language-model fallback
// answers without one, so these read as undefined on a workspace that has no
// evaluation provider. The label says so, because the picker cannot show a
// value that depends on which model answers at run time.
const buildProbabilitiesNode = (keys: string[]): Node => ({
  isLeaf: false,
  type: 'object',
  label: 'Probabilities (evaluation models only)',
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
            .filter((criterion) => criterion.name.length > 0)
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
        .filter((question) => question.name.length > 0)
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
