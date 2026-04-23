import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneViewSort } from 'test/integration/metadata/suites/view-sort/utils/create-one-view-sort.util';
import { deleteOneViewSort } from 'test/integration/metadata/suites/view-sort/utils/delete-one-view-sort.util';
import { destroyOneViewSort } from 'test/integration/metadata/suites/view-sort/utils/destroy-one-view-sort.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { FieldMetadataType, ViewType } from 'twenty-shared/types';

import { ViewSortDirection } from 'src/engine/metadata-modules/view-sort/enums/view-sort-direction';

describe('View Sort deletion should succeed', () => {
  let testObjectMetadataId: string;
  let testFieldMetadataId: string;
  let createdViewId: string;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'testViewSortDeletionObject',
        namePlural: 'testViewSortDeletionObjects',
        labelSingular: 'Test View Sort Deletion Object',
        labelPlural: 'Test View Sort Deletion Objects',
        icon: 'IconSort',
      },
    });

    testObjectMetadataId = objectMetadataId;

    const {
      data: {
        createOneField: { id: fieldMetadataId },
      },
    } = await createOneFieldMetadata({
      input: {
        name: 'testSortDeletionField',
        label: 'Test Sort Deletion Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: testObjectMetadataId,
        isLabelSyncedWithName: true,
      },
      gqlFields: 'id name label',
    });

    testFieldMetadataId = fieldMetadataId;

    const { data: viewData } = await createOneView({
      expectToFail: false,
      input: {
        name: 'Test View For View Sort Deletion',
        objectMetadataId: testObjectMetadataId,
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

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: testObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      input: { idToDelete: testObjectMetadataId },
    });
  });

  it('should soft delete a view sort', async () => {
    const { data: createData } = await createOneViewSort({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        fieldMetadataId: testFieldMetadataId,
        direction: ViewSortDirection.ASC,
      },
    });

    const viewSortId = createData?.createViewSort?.id;

    jestExpectToBeDefined(viewSortId);

    const { data: deleteData } = await deleteOneViewSort({
      expectToFail: false,
      input: { id: viewSortId },
    });

    expect(deleteData.deleteViewSort).toBe(true);

    // Clean up
    await destroyOneViewSort({
      expectToFail: false,
      input: { id: viewSortId },
    });
  });
});
