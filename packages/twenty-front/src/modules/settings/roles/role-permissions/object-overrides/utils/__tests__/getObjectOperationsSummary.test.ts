import { getObjectOperationsSummary } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectOperationsSummary';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { IconAdjustments, IconEyeOff, IconPencil } from 'twenty-ui/icon';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

describe('getObjectOperationsSummary', () => {
  beforeAll(() => {
    dynamicActivate(SOURCE_LOCALE);
  });

  it('should join the allowed operations in order and show the highest one', () => {
    expect(
      getObjectOperationsSummary({
        operations: ['canUpdateObjectRecords', 'canReadObjectRecords'],
        isAdvanced: false,
      }),
    ).toEqual({ label: 'See, edit', Icon: IconPencil });
  });

  it('should say no access when no operation is allowed', () => {
    expect(
      getObjectOperationsSummary({ operations: [], isAdvanced: false }),
    ).toEqual({ label: 'No access', Icon: IconEyeOff });
  });

  it('should show the advanced icon when asked', () => {
    expect(
      getObjectOperationsSummary({
        operations: ['canReadObjectRecords'],
        isAdvanced: true,
      }).Icon,
    ).toBe(IconAdjustments);
  });
});
