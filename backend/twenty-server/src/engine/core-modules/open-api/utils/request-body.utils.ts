import { v4 } from 'uuid';

export const getRequestBody = (name: string) => {
  return {
    description: 'body',
    required: true,
    content: {
      'application/json': {
        schema: {
          $ref: `#/components/schemas/${name}`,
        },
      },
    },
  };
};

export const getUpdateRequestBody = (name: string) => {
  return {
    description: 'body',
    required: true,
    content: {
      'application/json': {
        schema: {
          $ref: `#/components/schemas/${name}ForUpdate`,
        },
      },
    },
  };
};

export const getArrayRequestBody = (name: string) => {
  return {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            $ref: `#/components/schemas/${name}`,
          },
        },
      },
    },
  };
};

export const getFindDuplicatesRequestBody = (name: string) => {
  return {
    description: 'body',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: `#/components/schemas/${name}`,
              },
            },
            ids: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uuid',
              },
            },
          },
          example: { ids: [v4()] },
        },
      },
    },
  };
};

export const getMergeManyRequestBody = () => {
  return {
    description: 'body',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            ids: {
              type: 'array',
              description: 'The IDs of the records to merge',
              items: {
                type: 'string',
                format: 'uuid',
              },
            },
            conflictPriorityIndex: {
              type: 'number',
              description:
                'The index of the record to use when conflicts occur',
            },
            dryRun: {
              description:
                'If true, the merge will not be performed and a preview of the merge will be returned.',
              type: 'boolean',
              default: false,
            },
          },
          example: { ids: [v4()], conflictPriorityIndex: 0, dryRun: false },
          required: ['ids', 'conflictPriorityIndex'],
        },
      },
    },
  };
};
