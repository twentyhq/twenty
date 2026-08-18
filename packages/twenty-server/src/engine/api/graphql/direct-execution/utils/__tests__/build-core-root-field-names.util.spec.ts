import { buildSchema } from 'graphql';

import { buildCoreRootFieldNames } from 'src/engine/api/graphql/direct-execution/utils/build-core-root-field-names.util';

describe('buildCoreRootFieldNames', () => {
  it('should collect query and mutation root field names', () => {
    const schema = buildSchema(`
      type Query {
        currentUser: String
        currentWorkspace: String
      }
      type Mutation {
        signIn: String
      }
    `);

    expect(buildCoreRootFieldNames(schema)).toEqual(
      new Set(['currentUser', 'currentWorkspace', 'signIn']),
    );
  });

  it('should return an empty set for a schema without root types', () => {
    const schema = buildSchema(`
      type Query
    `);

    expect(buildCoreRootFieldNames(schema)).toEqual(new Set());
  });
});
