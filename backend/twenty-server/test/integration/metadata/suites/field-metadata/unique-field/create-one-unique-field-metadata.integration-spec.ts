import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';

type SuccessfulTestCases = EachTestingContext<
  (args: {
    createdObjectMetadataId: string;
  }) => Omit<CreateFieldInput, 'workspaceId'>
>[];

type FailingTestCases = EachTestingContext<
  (args: {
    createdObjectMetadataId: string;
  }) => Omit<CreateFieldInput, 'workspaceId'>
>[];

const successfulTestCases: SuccessfulTestCases = [
  {
    title: 'should create one unique field metadata with TEXT type',
    context: ({ createdObjectMetadataId }) => ({
      name: 'uniqueTestField',
      label: 'Unique Test Field',
      type: FieldMetadataType.TEXT,
      objectMetadataId: createdObjectMetadataId,
      isUnique: true,
    }),
  },
  {
    title:
      'should create unique field metadata for composite type with unique subfields (EMAILS)',
    context: ({ createdObjectMetadataId }) => ({
      name: 'uniqueEmails',
      label: 'Unique Emails',
      type: FieldMetadataType.EMAILS,
      objectMetadataId: createdObjectMetadataId,
      isUnique: true,
    }),
  },
];

const failingTestCases: FailingTestCases = [
  {
    title: 'should fail when field has custom default value',
    context: ({ createdObjectMetadataId }) => ({
      name: 'uniqueFieldWithDefault',
      label: 'Unique Field With Default',
      type: FieldMetadataType.TEXT,
      objectMetadataId: createdObjectMetadataId,
      isUnique: true,
      defaultValue: "'?'",
    }),
  },
  {
    title:
      'should fail for composite type without unique subfields (FULL_NAME)',
    context: ({ createdObjectMetadataId }) => ({
      name: 'uniqueFullName',
      label: 'Unique Full Name',
      type: FieldMetadataType.FULL_NAME,
      objectMetadataId: createdObjectMetadataId,
      isUnique: true,
    }),
  },
];

describe('successful createOne unique field metadata', () => {
  let createdObjectMetadataId = '';

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'testObjectForUniqueField',
        namePlural: 'testObjectsForUniqueField',
        labelSingular: 'Test Object For Unique Field',
        labelPlural: 'Test Objects For Unique Field',
        icon: 'IconTest',
      },
    });

    createdObjectMetadataId = objectMetadataId;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: createdObjectMetadataId },
    });
  });

  it.each(eachTestingContextFilter(successfulTestCases))(
    '$title',
    async ({ context }) => {
      const contextPayload = context({
        createdObjectMetadataId,
      });

      const { data, errors } = await createOneFieldMetadata({
        input: contextPayload,
        expectToFail: false,
        gqlFields: `
          id
          name
          label
          type
          isUnique
        `,
      });

      expect(errors).toBeUndefined();
      expect(data).not.toBeNull();
      expect(data.createOneField).toBeDefined();
      expect(data.createOneField.name).toBe(contextPayload.name);
      expect(data.createOneField.isUnique).toBe(true);
    },
  );
});

describe('failing createOne unique field metadata', () => {
  let createdObjectMetadataId = '';

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'testObjectForFailingUniqueField',
        namePlural: 'testObjectsForFailingUniqueField',
        labelSingular: 'Test Object For Failing Unique Field',
        labelPlural: 'Test Objects For Failing Unique Field',
        icon: 'IconTest',
      },
    });

    createdObjectMetadataId = objectMetadataId;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: createdObjectMetadataId },
    });
  });

  it.each(eachTestingContextFilter(failingTestCases))(
    '$title',
    async ({ context }) => {
      const contextPayload = context({
        createdObjectMetadataId,
      });

      const { errors } = await createOneFieldMetadata({
        input: contextPayload,
        expectToFail: true,
      });

      expect(errors).toBeDefined();
      expect(errors.length).toBe(1);
      const [firstError] = errors;

      expect(firstError).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(firstError),
      );
      expect(firstError.extensions.code).not.toBe('INTERNAL_SERVER_ERROR');
    },
  );
});
