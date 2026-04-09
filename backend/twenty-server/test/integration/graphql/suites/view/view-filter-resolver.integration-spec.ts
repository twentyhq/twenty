import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createTestViewWithGraphQL } from 'test/integration/graphql/utils/view-graphql.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneViewFilter } from 'test/integration/metadata/suites/view-filter/utils/create-one-view-filter.util';
import { deleteOneViewFilter } from 'test/integration/metadata/suites/view-filter/utils/delete-one-view-filter.util';
import { destroyOneViewFilter } from 'test/integration/metadata/suites/view-filter/utils/destroy-one-view-filter.util';
import { findViewFilters } from 'test/integration/metadata/suites/view-filter/utils/find-view-filters.util';
import { updateOneViewFilter } from 'test/integration/metadata/suites/view-filter/utils/update-one-view-filter.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

const TEST_NOT_EXISTING_VIEW_FILTER_ID = '20202020-52c5-4152-8c09-76a845fb8ece';

describe('View Filter Resolver', () => {
  let testViewId: string;
  let testObjectMetadataId: string;
  let testFieldMetadataId: string;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'myFilterTestObject',
        namePlural: 'myFilterTestObjects',
        labelSingular: 'My Filter Test Object',
        labelPlural: 'My Filter Test Objects',
        icon: 'Icon123',
      },
    });

    testObjectMetadataId = objectMetadataId;

    const {
      data: {
        createOneField: { id: fieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'testField',
        label: 'Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: testObjectMetadataId,
        isLabelSyncedWithName: true,
      },
    });

    testFieldMetadataId = fieldMetadataId;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: testObjectMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: testObjectMetadataId },
    });
  });

  beforeEach(async () => {
    const view = await createTestViewWithGraphQL({
      name: 'Test View for Filters',
      objectMetadataId: testObjectMetadataId,
    });

    testViewId = view.id;
  });

  afterEach(async () => {
    await destroyOneView({
      viewId: testViewId,
      expectToFail: false,
    });
  });

  describe('getViewFilters', () => {
    it('should return empty array when no view filters exist', async () => {
      const { data, errors } = await findViewFilters({
        viewId: testViewId,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(data.getViewFilters).toEqual([]);
    });

    it('should return view filters for a specific view', async () => {
      await createOneViewFilter({
        input: {
          fieldMetadataId: testFieldMetadataId,
          viewId: testViewId,
          operand: ViewFilterOperand.CONTAINS,
          value: 'test',
        },
        expectToFail: false,
      });

      const { data, errors } = await findViewFilters({
        viewId: testViewId,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(data.getViewFilters).toHaveLength(1);
      expect(data.getViewFilters[0]).toMatchObject({
        fieldMetadataId: testFieldMetadataId,
        operand: ViewFilterOperand.CONTAINS,
        value: 'test',
        viewId: testViewId,
      });
    });
  });

  describe('createViewFilter', () => {
    it('should create a new view filter with string value', async () => {
      const { data, errors } = await createOneViewFilter({
        input: {
          fieldMetadataId: testFieldMetadataId,
          viewId: testViewId,
          operand: ViewFilterOperand.IS,
          value: 'test value',
        },
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(data.createViewFilter).toMatchObject({
        fieldMetadataId: testFieldMetadataId,
        operand: ViewFilterOperand.IS,
        value: 'test value',
        viewId: testViewId,
      });
    });

    it('should create a view filter with numeric value', async () => {
      const { data, errors } = await createOneViewFilter({
        input: {
          fieldMetadataId: testFieldMetadataId,
          viewId: testViewId,
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          value: 100,
        },
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(data.createViewFilter).toMatchObject({
        fieldMetadataId: testFieldMetadataId,
        operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
        value: 100,
        viewId: testViewId,
      });
    });

    it('should create a view filter with boolean value', async () => {
      const { data, errors } = await createOneViewFilter({
        input: {
          fieldMetadataId: testFieldMetadataId,
          viewId: testViewId,
          operand: ViewFilterOperand.IS,
          value: true,
        },
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(data.createViewFilter).toMatchObject({
        fieldMetadataId: testFieldMetadataId,
        operand: ViewFilterOperand.IS,
        value: true,
        viewId: testViewId,
      });
    });
  });

  describe('updateViewFilter', () => {
    it('should update an existing view filter', async () => {
      const { data: createData } = await createOneViewFilter({
        input: {
          fieldMetadataId: testFieldMetadataId,
          viewId: testViewId,
          operand: ViewFilterOperand.CONTAINS,
          value: 'original',
        },
        expectToFail: false,
      });

      const viewFilterId = createData.createViewFilter.id;

      const { data, errors } = await updateOneViewFilter({
        input: {
          id: viewFilterId,
          update: {
            operand: ViewFilterOperand.DOES_NOT_CONTAIN,
            value: 'updated',
          },
        },
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(data.updateViewFilter).toMatchObject({
        id: viewFilterId,
        operand: ViewFilterOperand.DOES_NOT_CONTAIN,
        value: 'updated',
      });
    });

    it('should throw an error when updating non-existent view filter', async () => {
      const { errors } = await updateOneViewFilter({
        input: {
          id: TEST_NOT_EXISTING_VIEW_FILTER_ID,
          update: {},
        },
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });
  });

  describe('deleteViewFilter', () => {
    it('should delete an existing view filter', async () => {
      const { data: createData } = await createOneViewFilter({
        input: {
          fieldMetadataId: testFieldMetadataId,
          viewId: testViewId,
          operand: ViewFilterOperand.CONTAINS,
          value: 'to delete',
        },
        expectToFail: false,
      });

      const viewFilterId = createData.createViewFilter.id;

      const { data, errors } = await deleteOneViewFilter({
        input: { id: viewFilterId },
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(data.deleteViewFilter).toMatchObject({
        id: viewFilterId,
      });
      expect(data.deleteViewFilter.deletedAt).toBeDefined();
    });

    it('should throw an error when deleting non-existent view filter', async () => {
      const { errors } = await deleteOneViewFilter({
        input: { id: TEST_NOT_EXISTING_VIEW_FILTER_ID },
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });
  });

  describe('destroyViewFilter', () => {
    it('should destroy an existing view filter', async () => {
      const { data: createData } = await createOneViewFilter({
        input: {
          fieldMetadataId: testFieldMetadataId,
          viewId: testViewId,
          operand: ViewFilterOperand.CONTAINS,
          value: 'to destroy',
        },
        expectToFail: false,
      });

      const viewFilterId = createData.createViewFilter.id;

      await deleteOneViewFilter({
        input: {
          id: viewFilterId,
        },
        expectToFail: false,
      });
      const { data, errors } = await destroyOneViewFilter({
        input: { id: viewFilterId },
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(data.destroyViewFilter).toMatchObject({
        id: viewFilterId,
      });
    });

    it('should throw an error when destroying non-existent view filter', async () => {
      const { errors } = await destroyOneViewFilter({
        input: { id: TEST_NOT_EXISTING_VIEW_FILTER_ID },
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });
  });
});
