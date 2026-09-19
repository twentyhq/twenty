import {
  type BaseOutputSchemaV2,
  type WorkflowClassifyQuestion,
} from 'twenty-shared/workflow';

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
        probabilities: {
          isLeaf: false,
          type: 'object',
          label: 'Probabilities',
          value: Object.fromEntries(
            question.criteria
              .filter((criterion) => criterion.name.length > 0)
              .map((criterion) => [
                criterion.name,
                {
                  isLeaf: true as const,
                  type: 'number' as const,
                  label: criterion.name,
                  value: 0,
                },
              ]),
          ),
        },
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
