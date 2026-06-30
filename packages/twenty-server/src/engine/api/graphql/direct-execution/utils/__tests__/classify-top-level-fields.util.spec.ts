import { parse } from 'graphql';

import { classifyTopLevelFields } from 'src/engine/api/graphql/direct-execution/utils/classify-top-level-fields.util';

const WORKSPACE_RESOLVERS = new Set([
  'findManyCompanies',
  'findOneCompany',
  'createOneCompany',
  'findManyPeople',
  'findOnePerson',
]);

describe('classifyTopLevelFields', () => {
  it('should classify a pure introspection query', () => {
    const query = `
      query {
        __schema { types { name } }
        __type(name: "Company") { name }
      }
    `;

    expect(
      classifyTopLevelFields(parse(query), undefined, WORKSPACE_RESOLVERS),
    ).toEqual({
      hasIntrospectionFields: true,
      hasWorkspaceFields: false,
      hasCoreFields: false,
    });
  });

  it('should classify a pure workspace query', () => {
    const query = `
      query {
        findManyCompanies { id name }
        findOnePerson { id }
      }
    `;

    expect(
      classifyTopLevelFields(parse(query), undefined, WORKSPACE_RESOLVERS),
    ).toEqual({
      hasIntrospectionFields: false,
      hasWorkspaceFields: true,
      hasCoreFields: false,
    });
  });

  it('should classify a pure core query', () => {
    const query = `
      query {
        currentWorkspace { id }
        currentUser { id }
      }
    `;

    expect(
      classifyTopLevelFields(parse(query), undefined, WORKSPACE_RESOLVERS),
    ).toEqual({
      hasIntrospectionFields: false,
      hasWorkspaceFields: false,
      hasCoreFields: true,
    });
  });

  it('should classify a mixed introspection + workspace query', () => {
    const query = `
      query {
        __schema { types { name } }
        findManyCompanies { id }
      }
    `;

    expect(
      classifyTopLevelFields(parse(query), undefined, WORKSPACE_RESOLVERS),
    ).toEqual({
      hasIntrospectionFields: true,
      hasWorkspaceFields: true,
      hasCoreFields: false,
    });
  });

  it('should classify a mixed workspace + core query', () => {
    const query = `
      query {
        findManyCompanies { id }
        currentWorkspace { id }
      }
    `;

    expect(
      classifyTopLevelFields(parse(query), undefined, WORKSPACE_RESOLVERS),
    ).toEqual({
      hasIntrospectionFields: false,
      hasWorkspaceFields: true,
      hasCoreFields: true,
    });
  });

  it('should not classify __typename as introspection', () => {
    const query = `
      query {
        currentWorkspace { id __typename }
      }
    `;

    expect(
      classifyTopLevelFields(parse(query), undefined, WORKSPACE_RESOLVERS),
    ).toEqual({
      hasIntrospectionFields: false,
      hasWorkspaceFields: false,
      hasCoreFields: true,
    });
  });

  it('should expand fragment spreads when classifying', () => {
    const query = `
      query {
        __schema { types { name } }
        ...WorkspaceFragment
      }
      fragment WorkspaceFragment on Query {
        findManyCompanies { id }
      }
    `;

    expect(
      classifyTopLevelFields(parse(query), undefined, WORKSPACE_RESOLVERS),
    ).toEqual({
      hasIntrospectionFields: true,
      hasWorkspaceFields: true,
      hasCoreFields: false,
    });
  });

  it('should respect operationName', () => {
    const query = `
      query IntrospectionQuery {
        __schema { types { name } }
      }
      query WorkspaceQuery {
        findManyCompanies { id }
      }
    `;

    expect(
      classifyTopLevelFields(
        parse(query),
        'IntrospectionQuery',
        WORKSPACE_RESOLVERS,
      ),
    ).toEqual({
      hasIntrospectionFields: true,
      hasWorkspaceFields: false,
      hasCoreFields: false,
    });

    expect(
      classifyTopLevelFields(
        parse(query),
        'WorkspaceQuery',
        WORKSPACE_RESOLVERS,
      ),
    ).toEqual({
      hasIntrospectionFields: false,
      hasWorkspaceFields: true,
      hasCoreFields: false,
    });
  });
});
