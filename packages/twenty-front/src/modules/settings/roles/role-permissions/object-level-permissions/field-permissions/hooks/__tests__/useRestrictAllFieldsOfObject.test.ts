import { act, renderHook } from '@testing-library/react';
import { useRestrictReadOnAllFieldsOfObject } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useRestrictReadOnAllFieldsOfObject';
import { useRestrictUpdateOnAllFieldsOfObject } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useRestrictUpdateOnAllFieldsOfObject';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import {
  MOCK_ROLE_ID_GRANTS_ALL,
  initializeRolesMockJotaiStore,
  rolesMockHookWrapper,
} from '~/testing/mock-data/roles/roles-mock';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

const getFieldNameOrThrow = (fieldMetadataId: string) => {
  const fieldMetadataItem = personObjectMetadataItem.fields.find(
    (field) => field.id === fieldMetadataId,
  );

  if (fieldMetadataItem === undefined) {
    throw new Error(`Field ${fieldMetadataId} not found on person`);
  }

  return fieldMetadataItem.name;
};

const renderRestrictHooks = () =>
  renderHook(
    () => ({
      ...useRestrictReadOnAllFieldsOfObject({
        roleId: MOCK_ROLE_ID_GRANTS_ALL,
      }),
      ...useRestrictUpdateOnAllFieldsOfObject({
        roleId: MOCK_ROLE_ID_GRANTS_ALL,
      }),
      settingsDraftRole: useAtomFamilyStateValue(
        settingsDraftRoleFamilyState,
        MOCK_ROLE_ID_GRANTS_ALL,
      ),
    }),
    { wrapper: rolesMockHookWrapper },
  );

const getRestrictedFieldNames = (
  settingsDraftRole: RoleWithPartialMembers,
  restriction: 'canReadFieldValue' | 'canUpdateFieldValue',
) =>
  (settingsDraftRole.fieldPermissions ?? [])
    .filter(
      (fieldPermission) =>
        fieldPermission.objectMetadataId === personObjectMetadataItem.id &&
        fieldPermission[restriction] === false,
    )
    .map((fieldPermission) =>
      getFieldNameOrThrow(fieldPermission.fieldMetadataId),
    );

describe('restricting all fields of an object', () => {
  beforeEach(() => {
    initializeRolesMockJotaiStore();
  });

  it('should not restrict read on system fields nor on the label identifier', () => {
    const { result } = renderRestrictHooks();

    act(() => {
      result.current.restrictReadOnAllFieldsOfObject(personObjectMetadataItem);
    });

    const restrictedFieldNames = getRestrictedFieldNames(
      result.current.settingsDraftRole,
      'canReadFieldValue',
    );

    expect(restrictedFieldNames).toContain('emails');
    expect(restrictedFieldNames).not.toContain('name');
    expect(restrictedFieldNames).not.toContain('createdAt');
    expect(restrictedFieldNames).not.toContain('updatedAt');
    expect(restrictedFieldNames).not.toContain('deletedAt');
    expect(restrictedFieldNames).not.toContain('createdBy');
  });

  it('should not restrict update on system fields', () => {
    const { result } = renderRestrictHooks();

    act(() => {
      result.current.restrictUpdateOnAllFieldsOfObject(
        personObjectMetadataItem,
      );
    });

    const restrictedFieldNames = getRestrictedFieldNames(
      result.current.settingsDraftRole,
      'canUpdateFieldValue',
    );

    expect(restrictedFieldNames).toContain('emails');
    expect(restrictedFieldNames).toContain('name');
    expect(restrictedFieldNames).not.toContain('createdAt');
    expect(restrictedFieldNames).not.toContain('updatedAt');
    expect(restrictedFieldNames).not.toContain('deletedAt');
    expect(restrictedFieldNames).not.toContain('createdBy');
  });

  it('should leave system fields untouched when field permissions already exist', () => {
    const { result } = renderRestrictHooks();

    act(() => {
      result.current.restrictUpdateOnAllFieldsOfObject(
        personObjectMetadataItem,
      );
    });

    act(() => {
      result.current.restrictReadOnAllFieldsOfObject(personObjectMetadataItem);
    });

    const restrictedFieldNames = getRestrictedFieldNames(
      result.current.settingsDraftRole,
      'canReadFieldValue',
    );

    expect(restrictedFieldNames).toContain('emails');
    expect(restrictedFieldNames).not.toContain('createdAt');
    expect(restrictedFieldNames).not.toContain('deletedAt');
  });
});
