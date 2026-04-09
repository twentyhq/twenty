import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/create-one-view-filter-group.util';
import { destroyOneViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/destroy-one-view-filter-group.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { ViewFilterGroupLogicalOperator, ViewType } from 'twenty-shared/types';

describe('View Filter Group creation should succeed', () => {
  let companyObjectMetadataId: string;
  let createdViewId: string;
  let createdViewFilterGroupId: string;

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: {},
        paging: { first: 1000 },
      },
      gqlFields: `
        id
        nameSingular
      `,
    });

    jestExpectToBeDefined(objects);

    const companyObjectMetadata = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'company',
    );

    jestExpectToBeDefined(companyObjectMetadata);
    companyObjectMetadataId = companyObjectMetadata.id;

    const { data: viewData } = await createOneView({
      expectToFail: false,
      input: {
        name: 'Test View For Filter Group',
        objectMetadataId: companyObjectMetadataId,
        type: ViewType.TABLE,
        icon: 'IconBuildingSkyscraper',
      },
    });

    createdViewId = viewData?.createView?.id;
  });

  afterAll(async () => {
    if (createdViewId) {
      await destroyOneView({
        expectToFail: false,
        viewId: createdViewId,
      });
    }
  });

  afterEach(async () => {
    if (createdViewFilterGroupId) {
      await destroyOneViewFilterGroup({
        expectToFail: false,
        id: createdViewFilterGroupId,
      });
      createdViewFilterGroupId = '';
    }
  });

  it('should create a view filter group with minimal input', async () => {
    const { data } = await createOneViewFilterGroup({
      expectToFail: false,
      input: {
        viewId: createdViewId,
      },
    });

    createdViewFilterGroupId = data?.createViewFilterGroup?.id;

    expect(data.createViewFilterGroup).toMatchObject({
      id: expect.any(String),
      viewId: createdViewId,
      logicalOperator: ViewFilterGroupLogicalOperator.AND,
      parentViewFilterGroupId: null,
    });
  });

  it('should create a view filter group with all fields', async () => {
    const { data } = await createOneViewFilterGroup({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        logicalOperator: ViewFilterGroupLogicalOperator.OR,
        positionInViewFilterGroup: 1,
      },
    });

    createdViewFilterGroupId = data?.createViewFilterGroup?.id;

    expect(data.createViewFilterGroup).toMatchObject({
      id: expect.any(String),
      viewId: createdViewId,
      logicalOperator: ViewFilterGroupLogicalOperator.OR,
      parentViewFilterGroupId: null,
    });
  });

  it('should create a nested view filter group', async () => {
    // Create parent filter group
    const { data: parentData } = await createOneViewFilterGroup({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      },
    });

    const parentViewFilterGroupId = parentData?.createViewFilterGroup?.id;

    // Create child filter group
    const { data: childData } = await createOneViewFilterGroup({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        logicalOperator: ViewFilterGroupLogicalOperator.OR,
        parentViewFilterGroupId,
      },
    });

    createdViewFilterGroupId = childData?.createViewFilterGroup?.id;

    expect(childData.createViewFilterGroup).toMatchObject({
      id: expect.any(String),
      viewId: createdViewId,
      logicalOperator: ViewFilterGroupLogicalOperator.OR,
      parentViewFilterGroupId,
    });

    // Clean up parent (this CASCADE-deletes the child too)
    await destroyOneViewFilterGroup({
      expectToFail: false,
      id: parentViewFilterGroupId,
    });

    // Clear the child ID since it was CASCADE-deleted with the parent
    createdViewFilterGroupId = '';
  });
});
