import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const generateDocumentInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    templateId: {
      type: 'string',
      label: 'Document template',
      description: 'The id of the document template to render.',
    },
    recordId: {
      type: 'string',
      label: 'Record',
      description:
        'The id of the Person or Company whose data fills the template placeholders.',
    },
  },
  required: ['templateId', 'recordId'],
  additionalProperties: false,
};
