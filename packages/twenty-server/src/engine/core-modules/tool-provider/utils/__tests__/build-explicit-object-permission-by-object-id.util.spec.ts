import { buildExplicitObjectPermissionByObjectId } from 'src/engine/core-modules/tool-provider/utils/build-explicit-object-permission-by-object-id.util';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const buildFlatObjectMetadataMaps = (
  objects: { id: string; universalIdentifier: string }[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    objects.map((object) => [
      object.universalIdentifier,
      getFlatObjectMetadataMock(object),
    ]),
  ),
});

const flatObjectMetadataMaps = buildFlatObjectMetadataMaps([
  { id: 'company-id', universalIdentifier: 'company' },
  { id: 'person-id', universalIdentifier: 'person' },
]);

describe('buildExplicitObjectPermissionByObjectId', () => {
  it('lets an object denied by the scope override its all-objects grant', () => {
    const permissionByObjectId = buildExplicitObjectPermissionByObjectId({
      explicitObjectGrants: {
        type: 'scope',
        scope: {
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: true,
          objectPermissions: [
            {
              objectUniversalIdentifier: 'person',
              canReadObjectRecords: false,
              canUpdateObjectRecords: false,
            },
          ],
        },
      },
      flatObjectPermissionMaps: { byUniversalIdentifier: {} },
      flatObjectMetadataMaps,
    });

    expect(permissionByObjectId.get('company-id')).toEqual({
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    });
    expect(permissionByObjectId.has('person-id')).toBe(false);
  });

  it('grants an object the scope names on its own', () => {
    const permissionByObjectId = buildExplicitObjectPermissionByObjectId({
      explicitObjectGrants: {
        type: 'scope',
        scope: {
          objectPermissions: [
            {
              objectUniversalIdentifier: 'company',
              canReadObjectRecords: true,
            },
          ],
        },
      },
      flatObjectPermissionMaps: { byUniversalIdentifier: {} },
      flatObjectMetadataMaps,
    });

    expect([...permissionByObjectId.keys()]).toEqual(['company-id']);
    expect(permissionByObjectId.get('company-id')?.canReadObjectRecords).toBe(
      true,
    );
  });
});
