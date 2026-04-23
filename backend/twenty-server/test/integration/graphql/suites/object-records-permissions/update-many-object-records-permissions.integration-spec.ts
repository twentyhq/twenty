import { randomUUID } from 'node:crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { makeGraphqlAPIRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';
import { makeGraphqlAPIRequestWithGuestRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-guest-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

describe('updateManyObjectRecordsPermissions', () => {
  let createdPersonIds: string[] = [];

  afterEach(async () => {
    if (createdPersonIds.length > 0) {
      await deleteRecordsByIds('person', createdPersonIds);
      createdPersonIds = [];
    }
  });

  it('should throw a permission error when user does not have permission (guest role)', async () => {
    const personId1 = randomUUID();
    const personId2 = randomUUID();
    const createGraphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      data: [
        {
          id: personId1,
        },
        {
          id: personId2,
        },
      ],
    });

    await makeGraphqlAPIRequest(createGraphqlOperation);
    createdPersonIds.push(personId1, personId2);

    const updateGraphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {
        id: {
          in: [personId1, personId2],
        },
      },
      data: {
        jobTitle: 'Senior Developer',
      },
    });

    const response = await makeGraphqlAPIRequestWithGuestRole(
      updateGraphqlOperation,
    );

    expect(response.body.data).toStrictEqual({ updatePeople: null });
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('should update multiple object records when user has permission (admin role)', async () => {
    const personId1 = randomUUID();
    const personId2 = randomUUID();
    const createGraphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      data: [
        {
          id: personId1,
        },
        {
          id: personId2,
        },
      ],
    });

    await makeGraphqlAPIRequest(createGraphqlOperation);
    createdPersonIds.push(personId1, personId2);

    const updateGraphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {
        id: {
          in: [personId1, personId2],
        },
      },
      data: {
        jobTitle: 'Tech Lead',
      },
    });

    const response = await makeGraphqlAPIRequest(updateGraphqlOperation);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.updatePeople).toBeDefined();
    expect(response.body.data.updatePeople).toHaveLength(2);
    expect(response.body.data.updatePeople[0].id).toBe(personId1);
    expect(response.body.data.updatePeople[1].id).toBe(personId2);
    expect(response.body.data.updatePeople[0].jobTitle).toBe('Tech Lead');
    expect(response.body.data.updatePeople[1].jobTitle).toBe('Tech Lead');
  });

  it('should update multiple object records when executed by api key', async () => {
    const personId1 = randomUUID();
    const personId2 = randomUUID();
    const createGraphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      data: [
        {
          id: personId1,
        },
        {
          id: personId2,
        },
      ],
    });

    await makeGraphqlAPIRequest(createGraphqlOperation);
    createdPersonIds.push(personId1, personId2);

    const updateGraphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {
        id: {
          in: [personId1, personId2],
        },
      },
      data: {
        jobTitle: 'Product Manager',
      },
    });

    const response = await makeGraphqlAPIRequestWithApiKey(
      updateGraphqlOperation,
    );

    expect(response.body.data).toBeDefined();
    expect(response.body.data.updatePeople).toBeDefined();
    expect(response.body.data.updatePeople).toHaveLength(2);
    expect(response.body.data.updatePeople[0].id).toBe(personId1);
    expect(response.body.data.updatePeople[1].id).toBe(personId2);
    expect(response.body.data.updatePeople[0].jobTitle).toBe('Product Manager');
    expect(response.body.data.updatePeople[1].jobTitle).toBe('Product Manager');
  });
});
