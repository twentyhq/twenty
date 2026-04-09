import { faker } from '@faker-js/faker';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { createManyNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/create-many-navigation-menu-items.util';
import { deleteManyNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/delete-many-navigation-menu-items.util';
import { findNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/find-navigation-menu-items.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

describe('NavigationMenuItem batch creation should succeed', () => {
  let personObjectMetadataId: string;
  let companyObjectMetadataId: string;
  let createdIds: string[] = [];

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

    const personObjectMetadata = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'person',
    );
    const companyObjectMetadata = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'company',
    );

    jestExpectToBeDefined(personObjectMetadata);
    jestExpectToBeDefined(companyObjectMetadata);

    personObjectMetadataId = personObjectMetadata.id;
    companyObjectMetadataId = companyObjectMetadata.id;
  });

  afterEach(async () => {
    if (createdIds.length > 0) {
      await deleteManyNavigationMenuItems({
        ids: createdIds,
        expectToFail: false,
      });
      createdIds = [];
    }
  });

  it('should create multiple navigation menu items in a single batch', async () => {
    const targetRecordId1 = faker.string.uuid();
    const targetRecordId2 = faker.string.uuid();

    const { data } = await createManyNavigationMenuItems({
      expectToFail: false,
      inputs: [
        {
          type: NavigationMenuItemType.RECORD,
          targetRecordId: targetRecordId1,
          targetObjectMetadataId: personObjectMetadataId,
        },
        {
          type: NavigationMenuItemType.RECORD,
          targetRecordId: targetRecordId2,
          targetObjectMetadataId: companyObjectMetadataId,
        },
      ],
    });

    jestExpectToBeDefined(data?.createManyNavigationMenuItems);

    const items = data.createManyNavigationMenuItems;

    createdIds = items.map((item) => item.id);

    expect(items).toHaveLength(2);

    expect(items[0]).toMatchObject({
      id: expect.any(String),
      targetRecordId: targetRecordId1,
      targetObjectMetadataId: personObjectMetadataId,
    });

    expect(items[1]).toMatchObject({
      id: expect.any(String),
      targetRecordId: targetRecordId2,
      targetObjectMetadataId: companyObjectMetadataId,
    });
  });

  it('should create a folder and a child item in a single batch', async () => {
    const folderId = faker.string.uuid();
    const targetRecordId = faker.string.uuid();

    const { data } = await createManyNavigationMenuItems({
      expectToFail: false,
      inputs: [
        {
          id: folderId,
          type: NavigationMenuItemType.FOLDER,
          name: 'Test Folder',
          position: 1,
        },
        {
          type: NavigationMenuItemType.RECORD,
          targetRecordId,
          targetObjectMetadataId: personObjectMetadataId,
          folderId,
          position: 1,
        },
      ],
    });

    jestExpectToBeDefined(data?.createManyNavigationMenuItems);

    const items = data.createManyNavigationMenuItems;

    createdIds = items.map((item) => item.id);

    expect(items).toHaveLength(2);

    expect(items[0]).toMatchObject({
      id: folderId,
      type: NavigationMenuItemType.FOLDER,
      name: 'Test Folder',
    });

    expect(items[1]).toMatchObject({
      targetRecordId,
      folderId,
    });
  });

  it('should preserve input order in the response', async () => {
    const targetRecordId1 = faker.string.uuid();
    const targetRecordId2 = faker.string.uuid();
    const targetRecordId3 = faker.string.uuid();

    const { data } = await createManyNavigationMenuItems({
      expectToFail: false,
      inputs: [
        {
          type: NavigationMenuItemType.RECORD,
          targetRecordId: targetRecordId1,
          targetObjectMetadataId: personObjectMetadataId,
          position: 3,
        },
        {
          type: NavigationMenuItemType.RECORD,
          targetRecordId: targetRecordId2,
          targetObjectMetadataId: personObjectMetadataId,
          position: 1,
        },
        {
          type: NavigationMenuItemType.RECORD,
          targetRecordId: targetRecordId3,
          targetObjectMetadataId: personObjectMetadataId,
          position: 2,
        },
      ],
    });

    jestExpectToBeDefined(data?.createManyNavigationMenuItems);

    const items = data.createManyNavigationMenuItems;

    createdIds = items.map((item) => item.id);

    expect(items).toHaveLength(3);
    expect(items[0].targetRecordId).toBe(targetRecordId1);
    expect(items[1].targetRecordId).toBe(targetRecordId2);
    expect(items[2].targetRecordId).toBe(targetRecordId3);
  });

  it('should return empty array for empty inputs', async () => {
    const { data } = await createManyNavigationMenuItems({
      expectToFail: false,
      inputs: [],
    });

    jestExpectToBeDefined(data?.createManyNavigationMenuItems);
    expect(data.createManyNavigationMenuItems).toHaveLength(0);
  });

  it('should create items visible in findAll', async () => {
    const targetRecordId = faker.string.uuid();

    const { data: createData } = await createManyNavigationMenuItems({
      expectToFail: false,
      inputs: [
        {
          type: NavigationMenuItemType.RECORD,
          targetRecordId,
          targetObjectMetadataId: personObjectMetadataId,
        },
      ],
    });

    jestExpectToBeDefined(createData?.createManyNavigationMenuItems);
    createdIds = createData.createManyNavigationMenuItems.map(
      (item) => item.id,
    );

    const { data: findData } = await findNavigationMenuItems({
      expectToFail: false,
      input: undefined,
    });

    const foundItem = findData.navigationMenuItems.find(
      (item) => item.id === createdIds[0],
    );

    expect(foundItem).toBeDefined();
  });
});
