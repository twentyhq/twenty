import {
  type ViewFieldTestSetup,
  cleanupViewFieldTest,
  setupViewFieldTest,
} from 'test/integration/graphql/suites/view/utils/setup-view-field-test.util';
import { createOneViewField } from 'test/integration/metadata/suites/view-field/utils/create-one-view-field.util';
import { deleteOneViewField } from 'test/integration/metadata/suites/view-field/utils/delete-one-view-field.util';
import { destroyOneViewField } from 'test/integration/metadata/suites/view-field/utils/destroy-one-view-field.util';
import { assertViewFieldStructure } from 'test/integration/utils/view-test.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';

import { type CreateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/create-view-field.input';
import { type ViewFieldDTO } from 'src/engine/metadata-modules/view-field/dtos/view-field.dto';

type TestContext = {
  viewFieldInput: (testSetup: ViewFieldTestSetup) => CreateViewFieldInput;
  expected: Partial<ViewFieldDTO>;
};

describe('View Field Resolver - Successful Create Operations', () => {
  let testSetup: ViewFieldTestSetup;
  let createdViewFieldId: string | undefined;

  beforeAll(async () => {
    testSetup = await setupViewFieldTest();
  });

  afterAll(async () => {
    await cleanupViewFieldTest(testSetup.testObjectMetadataId);
  });

  afterEach(async () => {
    if (isDefined(createdViewFieldId)) {
      const {
        data: { deleteViewField },
      } = await deleteOneViewField({
        expectToFail: false,
        input: {
          id: createdViewFieldId,
        },
      });

      expect(deleteViewField.deletedAt).not.toBeNull();
      await destroyOneViewField({
        expectToFail: false,
        input: {
          id: createdViewFieldId,
        },
      });
      createdViewFieldId = undefined;
    }
  });

  const successfulTestCases: EachTestingContext<TestContext>[] = [
    {
      title: 'visible field with position and size',
      context: {
        viewFieldInput: (testSetup) => ({
          fieldMetadataId: testSetup.testFieldMetadataId,
          viewId: testSetup.testViewId,
          position: 1,
          isVisible: true,
          size: 200,
        }),
        expected: {
          position: 1,
          isVisible: true,
          size: 200,
        },
      },
    },
    {
      title: 'hidden field with position and size',
      context: {
        viewFieldInput: (testSetup) => ({
          fieldMetadataId: testSetup.testFieldMetadataId,
          viewId: testSetup.testViewId,
          position: 2,
          isVisible: false,
          size: 100,
        }),
        expected: {
          position: 2,
          isVisible: false,
          size: 100,
        },
      },
    },
    {
      title: 'field with minimum required properties',
      context: {
        viewFieldInput: (testSetup) => ({
          fieldMetadataId: testSetup.testFieldMetadataId,
          viewId: testSetup.testViewId,
        }),
        expected: {
          position: 0,
          isVisible: true,
          size: 0,
        },
      },
    },
    {
      title: 'field with maximum size',
      context: {
        viewFieldInput: (testSetup) => ({
          fieldMetadataId: testSetup.testFieldMetadataId,
          viewId: testSetup.testViewId,
          position: 3,
          isVisible: true,
          size: 1000,
        }),
        expected: {
          position: 3,
          isVisible: true,
          size: 1000,
        },
      },
    },
  ];

  test.each(eachTestingContextFilter(successfulTestCases))(
    'Create $title',
    async ({ context: { viewFieldInput, expected } }) => {
      const response = await createOneViewField({
        input: viewFieldInput(testSetup),
        expectToFail: false,
      });

      expect(response.errors).toBeUndefined();
      expect(response.data.createViewField).toBeDefined();
      createdViewFieldId = response.data.createViewField.id;

      assertViewFieldStructure(response.data.createViewField, {
        fieldMetadataId: testSetup.testFieldMetadataId,
        viewId: testSetup.testViewId,
        ...expected,
      });
    },
  );
});
