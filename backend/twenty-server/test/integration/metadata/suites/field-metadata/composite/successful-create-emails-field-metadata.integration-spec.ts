import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';

const SUCCESSFUL_TEST_CASES: EachTestingContext<{
  input: Omit<CreateFieldInput, 'objectMetadataId' | 'type' | 'workspaceId'>;
}>[] = [
  {
    title: 'emails field with basic metadata (name, label, description, icon)',
    context: {
      input: {
        name: 'contactEmails',
        label: 'Contact Emails',
        description: 'Contact email addresses',
        icon: 'IconMail',
      },
    },
  },
  {
    title: 'emails field with maxNumberOfValues setting',
    context: {
      input: {
        name: 'limitedEmails',
        label: 'Limited Emails',
        settings: {
          maxNumberOfValues: 3,
        },
      },
    },
  },
  {
    title: 'emails field with default value containing primary email',
    context: {
      input: {
        name: 'defaultEmails',
        label: 'Default Emails',
        defaultValue: {
          primaryEmail: "'contact@example.com'",
          additionalEmails: null,
        },
      },
    },
  },
  {
    title: 'emails field with empty default value',
    context: {
      input: {
        name: 'emptyEmails',
        label: 'Empty Emails',
        defaultValue: {
          primaryEmail: "''",
          additionalEmails: null,
        },
      },
    },
  },
  {
    title: 'emails field with settings and default value',
    context: {
      input: {
        name: 'configuredEmails',
        label: 'Configured Emails',
        settings: {
          maxNumberOfValues: 5,
        },
        defaultValue: {
          primaryEmail: "'support@company.com'",
          additionalEmails: null,
        },
      },
    },
  },
];

describe('Emails field metadata creation tests suite', () => {
  let createdObjectMetadataId: string;
  let createdFieldMetadataId: string | undefined = undefined;

  beforeAll(async () => {
    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'testEmailsObject',
        namePlural: 'testEmailsObjects',
        labelSingular: 'Test Emails Object',
        labelPlural: 'Test Emails Objects',
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

  afterEach(async () => {
    if (createdFieldMetadataId) {
      await updateOneFieldMetadata({
        input: {
          updatePayload: { isActive: false },
          idToUpdate: createdFieldMetadataId,
        },
        expectToFail: false,
      });
      await deleteOneFieldMetadata({
        input: { idToDelete: createdFieldMetadataId },
        expectToFail: false,
      });
      createdFieldMetadataId = undefined;
    }
  });

  test.each(eachTestingContextFilter(SUCCESSFUL_TEST_CASES))(
    'it should create $title',
    async ({ context: { input } }) => {
      const inputPayload = {
        objectMetadataId: createdObjectMetadataId,
        type: FieldMetadataType.EMAILS,
        isLabelSyncedWithName: false,
        ...input,
      };
      const { data } = await createOneFieldMetadata({
        expectToFail: false,
        input: inputPayload,
        gqlFields: `
          id
          type
          name
          label
          description
          icon
          defaultValue
          isLabelSyncedWithName
          settings
        `,
      });

      createdFieldMetadataId = data.createOneField.id;

      const { objectMetadataId: _, ...expectedFields } = inputPayload;

      expect(data.createOneField).toMatchObject(expectedFields);
    },
  );
});
