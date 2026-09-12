import { GraphQLEnumType } from 'graphql';

export const RecordShareAccessLevelType = new GraphQLEnumType({
  name: 'RecordShareAccessLevel',
  description: 'This enum is used to specify the access granted on a record',
  values: {
    READ: {
      value: 'READ',
      description: 'Read the record',
    },
    READ_WRITE: {
      value: 'READ_WRITE',
      description: 'Read and update the record',
    },
    FULL: {
      value: 'FULL',
      description: 'Read, update, delete, restore and destroy the record',
    },
  },
});
