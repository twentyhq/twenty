import { parse } from 'graphql';

import { hasOnlyGeneratedWorkspaceResolvers } from 'src/engine/api/graphql/direct-execution/utils/has-only-generated-workspace-resolvers.util';

const GENERATED_RESOLVERS = new Set([
  'findManyCompanies',
  'findOneCompany',
  'createOneCompany',
  'findManyPeople',
  'findOnePerson',
]);

describe('hasOnlyGeneratedWorkspaceResolvers', () => {
  it('should return true when all fields are generated workspace resolvers', () => {
    const query = `
      query {
        findManyCompanies { id name }
        findManyPeople { id email }
      }
    `;

    expect(
      hasOnlyGeneratedWorkspaceResolvers(
        parse(query),
        undefined,
        GENERATED_RESOLVERS,
      ),
    ).toBe(true);
  });

  it('should return true for a single generated workspace resolver', () => {
    const query = `
      query {
        findOneCompany(filter: { id: { eq: "123" } }) { id }
      }
    `;

    expect(
      hasOnlyGeneratedWorkspaceResolvers(
        parse(query),
        undefined,
        GENERATED_RESOLVERS,
      ),
    ).toBe(true);
  });

  it('should return false when all fields are core resolvers', () => {
    const query = `
      query {
        currentWorkspace { id }
        currentUser { id }
      }
    `;

    expect(
      hasOnlyGeneratedWorkspaceResolvers(
        parse(query),
        undefined,
        GENERATED_RESOLVERS,
      ),
    ).toBe(false);
  });

  it('should return false for mixed queries', () => {
    const query = `
      query {
        findManyCompanies { id }
        currentWorkspace { id }
      }
    `;

    expect(
      hasOnlyGeneratedWorkspaceResolvers(
        parse(query),
        undefined,
        GENERATED_RESOLVERS,
      ),
    ).toBe(false);
  });

  it('should return true when no operation matches (no fields to check)', () => {
    const query = `
      query GetCompanies { findManyCompanies { id } }
    `;

    expect(
      hasOnlyGeneratedWorkspaceResolvers(
        parse(query),
        'NonExistent',
        GENERATED_RESOLVERS,
      ),
    ).toBe(true);
  });

  it('should respect operationName', () => {
    const query = `
      query WorkspaceQuery {
        findManyCompanies { id }
      }
      query CoreQuery {
        currentWorkspace { id }
      }
    `;

    expect(
      hasOnlyGeneratedWorkspaceResolvers(
        parse(query),
        'WorkspaceQuery',
        GENERATED_RESOLVERS,
      ),
    ).toBe(true);

    expect(
      hasOnlyGeneratedWorkspaceResolvers(
        parse(query),
        'CoreQuery',
        GENERATED_RESOLVERS,
      ),
    ).toBe(false);
  });
});
