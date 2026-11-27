import { getObjectOperationsSummary } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectOperationsSummary';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import {
  IconAdjustments,
  IconBoxMultiple2,
  IconEye,
  IconEyeOff,
} from 'twenty-ui/icon';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

describe('getObjectOperationsSummary', () => {
  beforeAll(() => {
    dynamicActivate(SOURCE_LOCALE);
  });

  it('should join the allowed operations in order and show their count', () => {
    expect(
      getObjectOperationsSummary({
        operations: ['canUpdateObjectRecords', 'canReadObjectRecords'],
        isAdvanced: false,
      }),
    ).toEqual({ label: 'See, edit', Icon: IconBoxMultiple2 });
  });

  it('should show the operation icon when only one is allowed', () => {
    expect(
      getObjectOperationsSummary({
        operations: ['canReadObjectRecords'],
        isAdvanced: false,
      }),
    ).toEqual({ label: 'See', Icon: IconEye });
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
