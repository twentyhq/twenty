import {
  UPDATE_FIELDS_OPTIONS,
  type UpdateFieldsOption,
} from 'src/constants/update-fields-options';

export const resolveUpdateFieldsMode = (
  updateFields?: UpdateFieldsOption,
): { shouldPersist: boolean; overrideExistingValues: boolean } => {
  if (updateFields === UPDATE_FIELDS_OPTIONS.no) {
    return { shouldPersist: false, overrideExistingValues: false };
  }

  if (updateFields === UPDATE_FIELDS_OPTIONS.overwrite) {
    return { shouldPersist: true, overrideExistingValues: true };
  }

  return { shouldPersist: true, overrideExistingValues: false };
};
