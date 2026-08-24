import { useHasAnyRelatedRecordAction } from '@/activities/hooks/useHasAnyRelatedRecordAction';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { renderHook } from '@testing-library/react';
import { PermissionFlagType } from '~/generated-metadata/graphql';

let mockCanUpdateObjectRecords = false;
let mockCanUploadFiles = false;
let mockPermissionValues: Partial<Record<PermissionFlagType, boolean>> = {};
const targetRecord: ActivityTargetableObject = {
  id: 'record-id',
  targetObjectNameSingular: 'company',
};

jest.mock('@/object-record/hooks/useCanUpdateObjectRecords', () => ({
  useCanUpdateObjectRecords: () => ({
    canUpdateObjectRecords: mockCanUpdateObjectRecords,
  }),
}));

jest.mock('@/activities/files/hooks/useCanUploadAttachmentFiles', () => ({
  useCanUploadAttachmentFiles: () => ({ canUploadFiles: mockCanUploadFiles }),
}));

jest.mock('@/settings/roles/hooks/useHasPermissionFlag', () => ({
  useHasPermissionFlag: (permissionFlag: PermissionFlagType) =>
    mockPermissionValues[permissionFlag] ?? false,
}));

describe('useHasAnyRelatedRecordAction', () => {
  beforeEach(() => {
    mockCanUpdateObjectRecords = false;
    mockCanUploadFiles = false;
    mockPermissionValues = {};
  });

  it('hides the launcher when no related action is available', () => {
    const { result } = renderHook(() =>
      useHasAnyRelatedRecordAction(targetRecord),
    );

    expect(result.current).toBe(false);
  });

  it.each([
    ['record updates', () => (mockCanUpdateObjectRecords = true)],
    ['file uploads', () => (mockCanUploadFiles = true)],
    [
      'email composition',
      () => (mockPermissionValues[PermissionFlagType.SEND_EMAIL_TOOL] = true),
    ],
    [
      'calendar event creation',
      () =>
        (mockPermissionValues[PermissionFlagType.CREATE_CALENDAR_EVENT_TOOL] =
          true),
    ],
  ])('shows the launcher for %s', (_label, enableAction) => {
    enableAction();

    const { result } = renderHook(() =>
      useHasAnyRelatedRecordAction(targetRecord),
    );

    expect(result.current).toBe(true);
  });
});
