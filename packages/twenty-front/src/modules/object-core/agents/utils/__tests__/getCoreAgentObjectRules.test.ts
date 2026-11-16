import { getCoreAgentObjectRules } from '@/object-core/agents/utils/getCoreAgentObjectRules';

describe('getCoreAgentObjectRules', () => {
  it('counts only the rules of the given object, once per field', () => {
    const role = {
      fieldPermissions: [
        {
          objectMetadataId: 'people',
          canReadFieldValue: false,
          canUpdateFieldValue: false,
        },
        {
          objectMetadataId: 'people',
          canReadFieldValue: false,
          canUpdateFieldValue: null,
        },
        {
          objectMetadataId: 'people',
          canReadFieldValue: null,
          canUpdateFieldValue: false,
        },
        {
          objectMetadataId: 'companies',
          canReadFieldValue: false,
          canUpdateFieldValue: false,
        },
      ],
      rowLevelPermissionPredicates: [{ objectMetadataId: 'companies' }],
    };

    expect(
      getCoreAgentObjectRules({ role, objectMetadataId: 'people' }),
    ).toEqual({
      hasRecordLevelFilter: false,
      unreadableFieldCount: 2,
      readOnlyFieldCount: 1,
    });
    expect(
      getCoreAgentObjectRules({ role, objectMetadataId: 'companies' }),
    ).toEqual({
      hasRecordLevelFilter: true,
      unreadableFieldCount: 1,
      readOnlyFieldCount: 0,
    });
  });
});
