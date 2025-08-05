import { renderHook } from '@testing-library/react';
import {
  MOCK_OBJECT_PERMISSION_1_REVOKES_ALL,
  MOCK_OBJECT_PERMISSION_2_GRANTS_ALL,
  MOCK_OBJECT_PERMISSION_3_NULL_ALL,
  MOCK_ROLE_ID_GRANTS_ALL,
  MOCK_ROLE_ID_REVOKES_ALL,
  rolesMockHookWrapper,
} from '~/testing/mock-data/roles/roles-mock';
import { useGetObjectPermissionDerivedStates } from '../useGetObjectPermissionDerivedStates';

describe('useGetObjectPermissionDerivedStates', () => {
  it('should return expected for object that revoke permissions', () => {
    const { result } = renderHook(
      () =>
        useGetObjectPermissionDerivedStates({
          roleId: MOCK_ROLE_ID_GRANTS_ALL,
        }),
      {
        wrapper: rolesMockHookWrapper,
      },
    );

    const {
      objectHasReadRevoked,
      objectHasUpdateRevoked,
      objectHasDeleteRevoked,
      objectHasDestroyRevoked,
      objectHasNoOverrideOnObjectPermission,
    } = result.current.getObjectPermissionDerivedStates(
      MOCK_OBJECT_PERMISSION_1_REVOKES_ALL.objectMetadataId,
    );

    expect(objectHasReadRevoked).toEqual(true);
    expect(objectHasUpdateRevoked).toEqual(true);
    expect(objectHasDeleteRevoked).toEqual(true);
    expect(objectHasDestroyRevoked).toEqual(true);
    expect(objectHasNoOverrideOnObjectPermission).toEqual(false);
  });

  it('should return expected for object that grants permissions', () => {
    const { result } = renderHook(
      () =>
        useGetObjectPermissionDerivedStates({
          roleId: MOCK_ROLE_ID_REVOKES_ALL,
        }),
      {
        wrapper: rolesMockHookWrapper,
      },
    );

    const {
      objectHasReadGranted,
      objectHasUpdateGranted,
      objectHasDeleteGranted,
      objectHasDestroyGranted,
      objectHasNoOverrideOnObjectPermission,
    } = result.current.getObjectPermissionDerivedStates(
      MOCK_OBJECT_PERMISSION_2_GRANTS_ALL.objectMetadataId,
    );

    expect(objectHasReadGranted).toEqual(true);
    expect(objectHasUpdateGranted).toEqual(true);
    expect(objectHasDeleteGranted).toEqual(true);
    expect(objectHasDestroyGranted).toEqual(true);
    expect(objectHasNoOverrideOnObjectPermission).toEqual(false);
  });

  it('should return expected field permission only', () => {
    const { result } = renderHook(
      () =>
        useGetObjectPermissionDerivedStates({
          roleId: MOCK_ROLE_ID_GRANTS_ALL,
        }),
      {
        wrapper: rolesMockHookWrapper,
      },
    );

    const {
      objectHasNoOverrideButFieldPermissionsShouldBeTakenIntoAccount,
      objectHasNoOverrideOnObjectPermission,
    } = result.current.getObjectPermissionDerivedStates(
      MOCK_OBJECT_PERMISSION_3_NULL_ALL.objectMetadataId,
    );

    expect(
      objectHasNoOverrideButFieldPermissionsShouldBeTakenIntoAccount,
    ).toEqual(true);
    expect(objectHasNoOverrideOnObjectPermission).toEqual(true);
  });
});
