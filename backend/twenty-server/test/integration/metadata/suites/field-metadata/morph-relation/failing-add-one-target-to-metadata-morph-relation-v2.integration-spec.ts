import { isDefined } from 'class-validator';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

describe('updateOne FieldMetadataService morph relation fields v2 - Add one target', () => {
  let createdObjectMetadataPersonId: string;
  let createdObjectMetadataOpportunityId: string;
  let createdObjectMetadataCompanyId: string;
  let createdObjectMetadataNewTargetId: string;
  let createdFieldMetadataId: string;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataPersonId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'personForMorphRelationSecond',
        namePlural: 'peopleForMorphRelationSecond',
        labelSingular: 'Person For Morph Relation',
        labelPlural: 'People For Morph Relation',
        icon: 'IconPerson',
      },
    });

    createdObjectMetadataPersonId = objectMetadataPersonId;

    const {
      data: {
        createOneObject: { id: objectMetadataCompanyId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'companyForMorphRelationSecond',
        namePlural: 'companiesForMorphRelationSecond',
        labelSingular: 'Company For Morph Relation',
        labelPlural: 'Companies For Morph Relation',
        icon: 'IconCompany',
      },
    });

    createdObjectMetadataCompanyId = objectMetadataCompanyId;

    const {
      data: {
        createOneObject: { id: objectMetadataOpportunityId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'opportunityForMorphRelationSecond',
        namePlural: 'opportunitiesForMorphRelationSecond',
        labelSingular: 'Opportunity For Morph Relation',
        labelPlural: 'Opportunities For Morph Relation',
        icon: 'IconOpportunity',
      },
    });

    createdObjectMetadataOpportunityId = objectMetadataOpportunityId;

    const {
      data: {
        createOneObject: { id: objectMetadataNewTargetId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'newTargetForMorphRelation',
        namePlural: 'newTargetsForMorphRelation',
        labelSingular: 'New Target For Morph Relation',
        labelPlural: 'New Targets For Morph Relation',
        icon: 'IconNewTarget',
      },
    });

    createdObjectMetadataNewTargetId = objectMetadataNewTargetId;
  });

  afterAll(async () => {
    const createdObjectMetadataIds = [
      createdObjectMetadataPersonId,
      createdObjectMetadataOpportunityId,
      createdObjectMetadataCompanyId,
      createdObjectMetadataNewTargetId,
    ];

    for (const objectMetadataId of createdObjectMetadataIds) {
      await updateOneObjectMetadata({
        expectToFail: false,
        input: {
          idToUpdate: objectMetadataId,
          updatePayload: { isActive: false },
        },
      });
      await deleteOneObjectMetadata({
        expectToFail: false,
        input: { idToDelete: objectMetadataId },
      });
    }
  });

  beforeEach(async () => {
    const {
      data: { createOneField: rawCreateOneField },
    } = await createOneFieldMetadata({
      input: {
        label: 'field label',
        name: 'fieldName',
        objectMetadataId: createdObjectMetadataCompanyId,
        description: 'Description for all',
        type: FieldMetadataType.MORPH_RELATION,
        morphRelationsCreationPayload: [
          {
            targetFieldIcon: 'Icon123',
            targetFieldLabel: 'toto',
            targetObjectMetadataId: createdObjectMetadataOpportunityId,
            type: RelationType.MANY_TO_ONE,
          },
          {
            targetFieldIcon: 'Icon123',
            targetFieldLabel: 'tata',
            targetObjectMetadataId: createdObjectMetadataPersonId,
            type: RelationType.MANY_TO_ONE,
          },
        ],
      },
      expectToFail: false,
    });

    createdFieldMetadataId = rawCreateOneField.id;
  });

  afterEach(async () => {
    if (!isDefined(createdFieldMetadataId)) {
      return;
    }

    await updateOneFieldMetadata({
      input: {
        idToUpdate: createdFieldMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
      expectToFail: false,
    });

    await deleteOneFieldMetadata({
      input: {
        idToDelete: createdFieldMetadataId,
      },
      expectToFail: false,
    });

    createdFieldMetadataId = '';
  });

  it('Should fail adding one object metadata target to pre-existing morph relation where object is already a target', async () => {
    const input = {
      idToUpdate: createdFieldMetadataId,
      updatePayload: {
        morphRelationsUpdatePayload: [
          {
            targetObjectMetadataId: createdObjectMetadataPersonId,
          },
        ],
      },
    };

    const { errors } = await updateOneFieldMetadata({
      expectToFail: true,
      input,
      gqlFields: `
      id
      name
      morphRelations {
        type
        targetFieldMetadata {
          id
          name
        }
      }
      `,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('Should fail adding one object metadata target to pre-existing morph relation where object is already source object', async () => {
    const input = {
      idToUpdate: createdFieldMetadataId,
      updatePayload: {
        morphRelationsUpdatePayload: [
          {
            targetObjectMetadataId: createdObjectMetadataCompanyId,
          },
        ],
      },
    };

    const { errors } = await updateOneFieldMetadata({
      expectToFail: true,
      input,
      gqlFields: `
      id
      name
      morphRelations {
        type
        targetFieldMetadata {
          id
          name
        }
        targetObjectMetadata {
          id
          nameSingular
        }
        sourceObjectMetadata {
          id
          nameSingular
        }
      }
      `,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
