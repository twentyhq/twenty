import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import { FieldMetadataType } from 'twenty-shared/types';

import { resolveAiRunPermissionScope } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/resolve-ai-run-permission-scope.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const PERSON_ID = 'person-id';
const COMPANY_ID = 'company-id';
const EMAIL_FIELD_ID = 'email-field-id';

const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> =
  createEmptyFlatEntityMaps();

for (const [id, universalIdentifier] of [
  [PERSON_ID, 'person'],
  [COMPANY_ID, 'company'],
]) {
  flatObjectMetadataMaps.byUniversalIdentifier[universalIdentifier] =
    getFlatObjectMetadataMock({ id, universalIdentifier, isSystem: false });
  flatObjectMetadataMaps.universalIdentifierById[id] = universalIdentifier;
}

const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> =
  createEmptyFlatEntityMaps();

flatFieldMetadataMaps.byUniversalIdentifier.email = getFlatFieldMetadataMock({
  id: EMAIL_FIELD_ID,
  universalIdentifier: 'email',
  objectMetadataId: PERSON_ID,
  type: FieldMetadataType.TEXT,
});
flatFieldMetadataMaps.universalIdentifierById[EMAIL_FIELD_ID] = 'email';

const resolve = (
  scope: Parameters<typeof resolveAiRunPermissionScope>[0]['scope'],
) =>
  resolveAiRunPermissionScope({
    scope,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

describe('resolveAiRunPermissionScope', () => {
  it('denies everything an empty scope leaves out', () => {
    const { objectsPermissions, grantedPermissionFlags } = resolve({});

    expect(objectsPermissions[PERSON_ID]?.canReadObjectRecords).toBe(false);
    expect(objectsPermissions[COMPANY_ID]?.canUpdateObjectRecords).toBe(false);
    expect(grantedPermissionFlags).toEqual([]);
  });

  it('allows only the actions it names on the objects it names', () => {
    const { objectsPermissions } = resolve({
      objectPermissions: [
        { objectUniversalIdentifier: 'person', canReadObjectRecords: true },
      ],
    });

    expect(objectsPermissions[PERSON_ID]).toMatchObject({
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
    });
    expect(objectsPermissions[COMPANY_ID]?.canReadObjectRecords).toBe(false);
  });

  it('lets an object entry narrow an action granted on all objects', () => {
    const { objectsPermissions } = resolve({
      canReadAllObjectRecords: true,
      objectPermissions: [
        { objectUniversalIdentifier: 'company', canReadObjectRecords: false },
      ],
    });

    expect(objectsPermissions[PERSON_ID]?.canReadObjectRecords).toBe(true);
    expect(objectsPermissions[COMPANY_ID]?.canReadObjectRecords).toBe(false);
  });

  it('restricts the fields it names', () => {
    const { objectsPermissions } = resolve({
      canReadAllObjectRecords: true,
      fieldPermissions: [
        {
          objectUniversalIdentifier: 'person',
          fieldUniversalIdentifier: 'email',
          canReadFieldValue: false,
        },
      ],
    });

    expect(
      objectsPermissions[PERSON_ID]?.restrictedFields[EMAIL_FIELD_ID],
    ).toMatchObject({ canRead: false });
  });

  it('grants nothing for an object the workspace does not have', () => {
    const { objectsPermissions } = resolve({
      objectPermissions: [
        { objectUniversalIdentifier: 'unknown', canReadObjectRecords: true },
      ],
    });

    expect(
      Object.values(objectsPermissions).some(
        (objectPermissions) => objectPermissions.canReadObjectRecords,
      ),
    ).toBe(false);
  });

  it('grants the flags it names, and tool flags with all tools', () => {
    expect(
      resolve({
        permissionFlagUniversalIdentifiers: [
          SystemPermissionFlag[PermissionFlagType.SEND_EMAIL_TOOL],
        ],
      }).grantedPermissionFlags,
    ).toEqual([PermissionFlagType.SEND_EMAIL_TOOL]);
    expect(
      resolve({ canAccessAllTools: true }).grantedPermissionFlags,
    ).toContain(PermissionFlagType.HTTP_REQUEST_TOOL);
    expect(
      resolve({ canAccessAllTools: true }).grantedPermissionFlags,
    ).not.toContain(PermissionFlagType.WORKFLOWS);
  });
});
