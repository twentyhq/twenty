import { parse } from 'graphql';

import { computeSkipWorkspaceSchemaCreation } from 'src/engine/api/graphql/direct-execution/utils/compute-skip-workspace-schema-creation.util';

const GENERATED_RESOLVERS = new Set([
  'findManyCompanies',
  'findOneCompany',
  'createOneCompany',
  'findManyPeople',
  'findOnePerson',
]);

describe('computeSkipWorkspaceSchemaCreation', () => {
  it('should return true when all fields are core resolvers', () => {
    const query = `
      query {
        currentWorkspace { id }
      }
    `;

    expect(
      computeSkipWorkspaceSchemaCreation(
        query,
        parse(query),
        undefined,
        GENERATED_RESOLVERS,
      ),
    ).toBe(true);
  });

  it('should return true for multiple core resolver fields', () => {
    const query = `
      query {
        currentWorkspace { id }
        currentUser { id }
      }
    `;

    expect(
      computeSkipWorkspaceSchemaCreation(
        query,
        parse(query),
        undefined,
        GENERATED_RESOLVERS,
      ),
    ).toBe(true);
  });

  it('should return true when all fields are generated workspace resolvers', () => {
    const query = `
      query {
        findManyCompanies { id name }
      }
    `;

    expect(
      computeSkipWorkspaceSchemaCreation(
        query,
        parse(query),
        undefined,
        GENERATED_RESOLVERS,
      ),
    ).toBe(true);
  });

  it('should return false for mixed queries', () => {
    const query = `
      query {
        findManyCompanies { id }
        currentWorkspace { id }
      }
    `;

    expect(
      computeSkipWorkspaceSchemaCreation(
        query,
        parse(query),
        undefined,
        GENERATED_RESOLVERS,
      ),
    ).toBe(false);
  });

  it('should return false for __schema introspection', () => {
    const query = `
      query {
        __schema { types { name } }
      }
    `;

    expect(
      computeSkipWorkspaceSchemaCreation(
        query,
        parse(query),
        undefined,
        GENERATED_RESOLVERS,
      ),
    ).toBe(false);
  });

  it('should return false for __type introspection', () => {
    const query = `
      query {
        __type(name: "Company") { name fields { name } }
      }
    `;

    expect(
      computeSkipWorkspaceSchemaCreation(
        query,
        parse(query),
        undefined,
        GENERATED_RESOLVERS,
      ),
    ).toBe(false);
  });

  it('should not treat __typename as introspection', () => {
    const query = `
      query {
        currentWorkspace { id __typename }
      }
    `;

    expect(
      computeSkipWorkspaceSchemaCreation(
        query,
        parse(query),
        undefined,
        GENERATED_RESOLVERS,
      ),
    ).toBe(true);
  });

  it('should return true when no operation matches (no fields to check)', () => {
    const query = `
      query GetCompanies { findManyCompanies { id } }
    `;

    expect(
      computeSkipWorkspaceSchemaCreation(
        query,
        parse(query),
        'NonExistent',
        GENERATED_RESOLVERS,
      ),
    ).toBe(true);
  });

  it('should respect operationName', () => {
    const query = `
      query CoreQuery {
        currentWorkspace { id }
      }
      query WorkspaceQuery {
        findManyCompanies { id }
      }
    `;

    expect(
      computeSkipWorkspaceSchemaCreation(
        query,
        parse(query),
        'CoreQuery',
        GENERATED_RESOLVERS,
      ),
    ).toBe(true);

    expect(
      computeSkipWorkspaceSchemaCreation(
        query,
        parse(query),
        'WorkspaceQuery',
        GENERATED_RESOLVERS,
      ),
    ).toBe(true);
  });
});
