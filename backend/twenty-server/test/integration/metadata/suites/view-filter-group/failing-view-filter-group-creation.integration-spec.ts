import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/create-one-view-filter-group.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { ViewType } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type CreateViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/create-view-filter-group.input';

type TestSetup = {
  createdViewId: string;
};

type TestContext = {
  input: (testSetup: TestSetup) => CreateViewFilterGroupInput;
};

const selfReferenceId = v4();

const failingViewFilterGroupCreationTestCases: EachTestingContext<TestContext>[] =
  [
    {
      title: 'when viewId is not a valid UUID',
      context: {
        input: () => ({
          viewId: 'invalid-uuid',
        }),
      },
    },
    {
      title: 'when viewId does not exist',
      context: {
        input: () => ({
          viewId: v4(),
        }),
      },
    },
    {
      title: 'when parentViewFilterGroupId does not exist',
      context: {
        input: (testSetup) => ({
          viewId: testSetup.createdViewId,
          parentViewFilterGroupId: v4(),
        }),
      },
    },
    {
      title: 'when parentViewFilterGroupId equals id (self-reference)',
      context: {
        input: (testSetup) => ({
          id: selfReferenceId,
          viewId: testSetup.createdViewId,
          parentViewFilterGroupId: selfReferenceId,
        }),
      },
    },
  ];

describe('View Filter Group creation should fail', () => {
  let createdViewId: string;

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

    const { data: viewData } = await createOneView({
      expectToFail: false,
      input: {
        name: 'Test View For Failing Filter Group Creation',
        objectMetadataId: companyObjectMetadata.id,
        type: ViewType.TABLE,
        icon: 'IconBuildingSkyscraper',
      },
    });

    createdViewId = viewData?.createView?.id;
    jestExpectToBeDefined(createdViewId);
  });

  afterAll(async () => {
    if (createdViewId) {
      await destroyOneView({
        expectToFail: false,
        viewId: createdViewId,
      });
    }
  });

  it.each(eachTestingContextFilter(failingViewFilterGroupCreationTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await createOneViewFilterGroup({
        expectToFail: true,
        input: context.input({ createdViewId }),
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
