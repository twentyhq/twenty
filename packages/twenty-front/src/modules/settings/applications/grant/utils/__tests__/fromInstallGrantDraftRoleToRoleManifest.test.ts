import { buildInstallGrantDraftRole } from '@/settings/applications/grant/utils/buildInstallGrantDraftRole';
import { fromInstallGrantDraftRoleToRoleManifest } from '@/settings/applications/grant/utils/fromInstallGrantDraftRoleToRoleManifest';
import { type RoleManifest } from 'twenty-shared/application';

const COMPANY = {
  id: 'company-id',
  universalIdentifier: 'company-universal-identifier',
  fields: [
    { id: 'domain-id', universalIdentifier: 'domain-universal-identifier' },
  ],
};
const PERSON = {
  id: 'person-id',
  universalIdentifier: 'person-universal-identifier',
  fields: [],
};
const OWN_OBJECT_UNIVERSAL_IDENTIFIER = 'own-object-universal-identifier';

const REQUEST: RoleManifest = {
  universalIdentifier: 'request',
  label: 'Request',
  canReadAllObjectRecords: true,
  objectPermissions: [
    {
      objectUniversalIdentifier: COMPANY.universalIdentifier,
      canUpdateObjectRecords: true,
    },
    {
      objectUniversalIdentifier: OWN_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: true,
    },
  ],
};

const objectMetadataItems = [COMPANY, PERSON] as Parameters<
  typeof fromInstallGrantDraftRoleToRoleManifest
>[0]['objectMetadataItems'];

describe('fromInstallGrantDraftRoleToRoleManifest', () => {
  it('turns a customized draft into a manifest and keeps rows the editor cannot show', () => {
    const requestedGrantRole = buildInstallGrantDraftRole({
      draftRoleId: 'draft',
      applicationName: 'App',
      requestedRoleManifest: REQUEST,
      objectMetadataItems,
    });

    const manifest = fromInstallGrantDraftRoleToRoleManifest({
      draftRole: {
        ...requestedGrantRole,
        canReadAllObjectRecords: false,
        objectPermissions: [
          ...(requestedGrantRole.objectPermissions ?? []),
          { objectMetadataId: PERSON.id, canReadObjectRecords: true },
        ],
        fieldPermissions: [
          {
            id: 'field-permission',
            roleId: 'draft',
            objectMetadataId: COMPANY.id,
            fieldMetadataId: 'domain-id',
            canReadFieldValue: false,
          },
        ],
      },
      requestedRoleManifest: REQUEST,
      objectMetadataItems,
    });

    expect(manifest.canReadAllObjectRecords).toBe(false);
    expect(
      manifest.objectPermissions?.map(
        ({ objectUniversalIdentifier, canReadObjectRecords }) => [
          objectUniversalIdentifier,
          canReadObjectRecords,
        ],
      ),
    ).toEqual([
      [OWN_OBJECT_UNIVERSAL_IDENTIFIER, true],
      [COMPANY.universalIdentifier, true],
      [PERSON.universalIdentifier, true],
    ]);
    expect(manifest.fieldPermissions).toEqual([
      {
        objectUniversalIdentifier: COMPANY.universalIdentifier,
        fieldUniversalIdentifier: 'domain-universal-identifier',
        canReadFieldValue: false,
        canUpdateFieldValue: undefined,
      },
    ]);
  });
});
