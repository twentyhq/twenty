import { gql } from '@apollo/client';

export const query = gql`
  mutation CreateOnePipelineStep($input: PipelineStepCreateInput!) {
    createPipelineStep(data: $input) {
      id
      name
      id
      createdAt
      opportunities {
        edges {
          node {
            id
          }
        }
      }
      position
      color
      updatedAt
    }
  }
`;

export const deleteQuery = gql`
  mutation DeleteOnePipelineStep($idToDelete: ID!) {
    deletePipelineStep(id: $idToDelete) {
      id
    }
  }
`;

export const mockId = '8f3b2121-f194-4ba4-9fbf-2d5a37126806';
export const currentPipelineId = 'f088c8c9-05d2-4276-b065-b863cc7d0b33';

const data = {
  color: 'yellow',
  id: 'columnId',
  position: 1,
  name: 'Column Title',
};

export const variables = {
  input: data,
};

export const deleteVariables = { idToDelete: 'columnId' };

export const responseData = {
  ...data,
  createdAt: '',
  opportunities: {
    edges: [],
  },
  updatedAt: '',
};

export const deleteResponseData = {
  id: 'columnId',
};
