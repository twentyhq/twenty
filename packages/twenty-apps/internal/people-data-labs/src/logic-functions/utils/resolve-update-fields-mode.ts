import { UPDATE_FIELDS_OPTIONS } from 'src/constants/update-fields-options';
import { type UpdateFieldsOption } from 'src/types/update-fields-option';

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
