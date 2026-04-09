import { UPDATE_ENUM_FIELD_METADATA_TEST_CASES } from 'test/integration/metadata/suites/field-metadata/enum/common/update-enum-field-metadata-test-cases';
import { type CreateOneFieldFactoryInput } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-query-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { CUSTOM_OBJECT_DISHES } from 'test/integration/metadata/suites/object-metadata/constants/custom-object-dishes.constants';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { eachTestingContextFilter } from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { fieldMetadataEnumTypes } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';

describe.each(fieldMetadataEnumTypes)(
  'Successful update field metadata %s tests suite v2',
  (testedFieldMetadataType) => {
    let createdObjectMetadataId: string;
    let createdFieldMetadataId: string;
    const testCases =
      UPDATE_ENUM_FIELD_METADATA_TEST_CASES[testedFieldMetadataType];

    if (!isDefined(testCases)) {
      return;
    }
    const { successful: successfulTestCases } = testCases;
    const initialOptions: CreateOneFieldFactoryInput['options'] = [
      {
        label: 'Option 1',
        value: 'OPTION_1',
        color: 'green',
        position: 1,
      },
      {
        label: 'Option 2',
        value: 'OPTION_2',
        color: 'green',
        position: 2,
      },
    ];

    beforeAll(async () => {
      const {
        labelPlural,
        description,
        labelSingular,
        namePlural,
        nameSingular,
      } = CUSTOM_OBJECT_DISHES;
      const { data } = await createOneObjectMetadata({
        input: {
          labelPlural,
          description,
          labelSingular,
          namePlural,
          nameSingular,
          icon: 'IconBuildingSkyscraper',
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

    beforeEach(async () => {
      const {
        data: { createOneField },
      } = await createOneFieldMetadata({
        expectToFail: false,
        input: {
          objectMetadataId: createdObjectMetadataId,
          type: testedFieldMetadataType,
          name: 'testField',
          label: 'Test Field',
          isLabelSyncedWithName: false,
          options: initialOptions,
        },
        gqlFields: `
          id
          type
          `,
      });

      createdFieldMetadataId = createOneField.id;
    });

    afterEach(async () => {
      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: createdFieldMetadataId,
          updatePayload: {
            isActive: false,
          },
        },
      });
      await deleteOneFieldMetadata({
        expectToFail: false,
        input: { idToDelete: createdFieldMetadataId },
      });
    });

    it('Should update default value to null even if it was set before', async () => {
      const isMultiSelect =
        testedFieldMetadataType === FieldMetadataType.MULTI_SELECT;
      const rawDefaultValue = `'${initialOptions[0].value}'`;
      const expectedDefaultValue = isMultiSelect
        ? [rawDefaultValue]
        : rawDefaultValue;

      const { data: firstUpdate } = await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: createdFieldMetadataId,
          updatePayload: {
            defaultValue: expectedDefaultValue,
          },
        },
        gqlFields: `
        id
        defaultValue
        `,
      });

      expect(firstUpdate.updateOneField.defaultValue).toEqual(
        expectedDefaultValue,
      );

      const updatedOptions = initialOptions.slice(1);
      const { data: secondUpdate, errors } = await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: createdFieldMetadataId,
          updatePayload: {
            defaultValue: null,
            options: updatedOptions,
          },
        },
        gqlFields: `
        id
        options
        defaultValue
        `,
      });

      expect(errors).toBeUndefined();
      expect(secondUpdate.updateOneField.defaultValue).toBeNull();
      expect(secondUpdate.updateOneField.options).toMatchObject(updatedOptions);
    });

    test.each(eachTestingContextFilter(successfulTestCases))(
      'Update $title',
      async ({ context: { input, expectedOptions } }) => {
        const { ...updatePayload } = input;

        const { data, errors } = await updateOneFieldMetadata({
          input: {
            idToUpdate: createdFieldMetadataId,
            updatePayload,
          },
          gqlFields: `
        id
        options
        defaultValue
        `,
        });

        expect(data.updateOneField).toBeDefined();
        const updatedOptions:
          | FieldMetadataComplexOption[]
          | FieldMetadataDefaultOption[]
          | null = data.updateOneField.options;

        expect(updatedOptions).toBeDefined();
        if (!isDefined(updatedOptions))
          throw new Error(
            'Should never occur, type invariant post test assertion',
          );

        expect(errors).toBeUndefined();
        updatedOptions.forEach((option) => expect(option.id).toBeDefined());

        const optionsToCompare = expectedOptions ?? input.options ?? [];

        expect(updatedOptions.length).toBe(optionsToCompare.length);
        expect(updatedOptions).toMatchObject(optionsToCompare);

        if (isDefined(input.defaultValue)) {
          expect(data.updateOneField.defaultValue).toEqual(input.defaultValue);
        }
      },
    );
  },
);
