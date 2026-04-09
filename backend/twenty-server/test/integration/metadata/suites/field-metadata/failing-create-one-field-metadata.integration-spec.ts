import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { FieldMetadataType } from 'twenty-shared/types';

describe('Failing create field metadata tests suite', () => {
  let createdObjectMetadataId: string;

  beforeAll(async () => {
    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'testFailingObject',
        namePlural: 'testFailingObjects',
        labelSingular: 'Test Failing Object',
        labelPlural: 'Test Failing Objects',
        icon: 'IconTestPipe',
        isLabelSyncedWithName: false,
      },
    });

    createdObjectMetadataId = data.createOneObject.id;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: createdObjectMetadataId },
    });
  });

  it.each([
    {
      type: FieldMetadataType.NUMERIC,
      name: 'numericField',
      expectedMessage: 'NUMERIC',
    },
    {
      type: FieldMetadataType.POSITION,
      name: 'positionField',
      expectedMessage: 'POSITION',
    },
    {
      type: FieldMetadataType.TS_VECTOR,
      name: 'tsVectorField',
      expectedMessage: 'TS Vector',
    },
  ])(
    'should fail to create $type field type via API',
    async ({ type, name, expectedMessage }) => {
      const { data, errors } = await createOneFieldMetadata({
        expectToFail: true,
        input: {
          objectMetadataId: createdObjectMetadataId,
          type,
          name,
          label: name,
          isLabelSyncedWithName: false,
        },
        gqlFields: `
          id
          type
          name
          label
        `,
      });

      expect(data).toBeNull();
      expect(errors).toBeDefined();
      expect(errors).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(errors),
      );
      expect(errors[0].extensions.code).toBe('METADATA_VALIDATION_FAILED');

      const errorDetails = JSON.stringify(errors[0].extensions.errors);

      expect(errorDetails).toContain(expectedMessage);
    },
  );
});
