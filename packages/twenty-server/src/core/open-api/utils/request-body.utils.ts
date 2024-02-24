import { capitalize } from 'src/utils/capitalize';

export const getRequestBody = (item) => {
  return {
    description: 'body',
    required: true,
    content: {
      'application/json': {
        schema: {
          $ref: `#/components/schemas/${capitalize(item.nameSingular)}`,
        },
      },
    },
  };
};
