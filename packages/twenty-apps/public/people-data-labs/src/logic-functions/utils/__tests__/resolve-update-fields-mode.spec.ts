import { describe, expect, it } from 'vitest';

import { UPDATE_FIELDS_OPTIONS } from 'src/constants/update-fields-options';
import { resolveUpdateFieldsMode } from 'src/logic-functions/utils/resolve-update-fields-mode';

describe('resolveUpdateFieldsMode', () => {
  it('persists and overwrites for "Yes and overwrite"', () => {
    expect(resolveUpdateFieldsMode(UPDATE_FIELDS_OPTIONS.overwrite)).toEqual({
      shouldPersist: true,
      overrideExistingValues: true,
    });
  });

  it('persists without overwriting for "Yes and don\'t overwrite"', () => {
    expect(resolveUpdateFieldsMode(UPDATE_FIELDS_OPTIONS.fillEmpty)).toEqual({
      shouldPersist: true,
      overrideExistingValues: false,
    });
  });

  it('does not persist for "No"', () => {
    expect(resolveUpdateFieldsMode(UPDATE_FIELDS_OPTIONS.no)).toEqual({
      shouldPersist: false,
      overrideExistingValues: false,
    });
  });

  it('defaults to fill-empty persisting when omitted', () => {
    expect(resolveUpdateFieldsMode(undefined)).toEqual({
      shouldPersist: true,
      overrideExistingValues: false,
    });
  });
});
