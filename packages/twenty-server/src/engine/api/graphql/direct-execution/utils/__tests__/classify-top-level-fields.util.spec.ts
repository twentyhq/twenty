import { parse } from 'graphql';

import { classifyTopLevelFields } from 'src/engine/api/graphql/direct-execution/utils/classify-top-level-fields.util';

const CORE_ROOT_FIELDS = new Set(['currentWorkspace', 'currentUser']);

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
      unknownFieldNames: [],
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
      unknownFieldNames: [],
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
      unknownFieldNames: [],
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
      unknownFieldNames: [],
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
      unknownFieldNames: [],
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
      unknownFieldNames: [],
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
      unknownFieldNames: [],
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
      unknownFieldNames: [],
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
      unknownFieldNames: [],
    });
  });

  it('should report a field that is neither a workspace resolver nor a core field as unknown', () => {
    const query = `
      query {
        findManyCompanies { id }
        deletedObjects { id }
      }
    `;

    expect(
      classifyTopLevelFields(
        parse(query),
        undefined,
        WORKSPACE_RESOLVERS,
        CORE_ROOT_FIELDS,
      ),
    ).toEqual({
      hasIntrospectionFields: false,
      hasWorkspaceFields: true,
      hasCoreFields: false,
      unknownFieldNames: ['deletedObjects'],
    });
  });

  it('should classify known core fields as core when the core schema is known', () => {
    const query = `
      query {
        currentWorkspace { id }
      }
    `;

    expect(
      classifyTopLevelFields(
        parse(query),
        undefined,
        WORKSPACE_RESOLVERS,
        CORE_ROOT_FIELDS,
      ),
    ).toEqual({
      hasIntrospectionFields: false,
      hasWorkspaceFields: false,
      hasCoreFields: true,
      unknownFieldNames: [],
    });
  });

  it('should fall back to classifying unknown fields as core when the core schema is not known yet', () => {
    const query = `
      query {
        deletedObjects { id }
      }
    `;

    expect(
      classifyTopLevelFields(
        parse(query),
        undefined,
        WORKSPACE_RESOLVERS,
        new Set(),
      ),
    ).toEqual({
      hasIntrospectionFields: false,
      hasWorkspaceFields: false,
      hasCoreFields: true,
      unknownFieldNames: [],
    });
  });
});
