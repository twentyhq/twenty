import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/create-one-view-filter-group.util';
import { destroyOneViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/destroy-one-view-filter-group.util';
import { updateOneViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/update-one-view-filter-group.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { ViewFilterGroupLogicalOperator, ViewType } from 'twenty-shared/types';

describe('View Filter Group update should succeed', () => {
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
        name: 'Test View For Filter Group Update',
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

  beforeEach(async () => {
    const { data } = await createOneViewFilterGroup({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      },
    });

    createdViewFilterGroupId = data?.createViewFilterGroup?.id;
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

  it('should update the logical operator', async () => {
    const { data } = await updateOneViewFilterGroup({
      id: createdViewFilterGroupId,
      expectToFail: false,
      input: {
        logicalOperator: ViewFilterGroupLogicalOperator.OR,
      },
    });

    expect(data.updateViewFilterGroup).toMatchObject({
      id: createdViewFilterGroupId,
      logicalOperator: ViewFilterGroupLogicalOperator.OR,
    });
  });

  it('should update the position', async () => {
    const { data } = await updateOneViewFilterGroup({
      id: createdViewFilterGroupId,
      expectToFail: false,
      input: {
        positionInViewFilterGroup: 5,
      },
    });

    expect(data.updateViewFilterGroup).toMatchObject({
      id: createdViewFilterGroupId,
      positionInViewFilterGroup: 5,
    });
  });
});
