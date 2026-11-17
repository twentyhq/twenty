import { getObjectPermissionActionsLabel } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionActionsLabel';
import { i18n } from '@lingui/core';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

describe('getObjectPermissionActionsLabel', () => {
  beforeAll(() => {
    dynamicActivate(SOURCE_LOCALE);
  });

  it('should join the allowed operations in order', () => {
    expect(
      getObjectPermissionActionsLabel([
        'canUpdateObjectRecords',
        'canReadObjectRecords',
      ]),
    ).toBe('See, edit');
    expect(i18n.locale).toBe(SOURCE_LOCALE);
  });

  it('should say no access when no operation is allowed', () => {
    expect(getObjectPermissionActionsLabel([])).toBe('No access');
  });
});
