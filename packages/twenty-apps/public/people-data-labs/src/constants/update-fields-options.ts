import { type UpdateFieldsOption } from 'src/types/update-fields-option';

export const UPDATE_FIELDS_OPTIONS = {
  overwrite: 'Yes and overwrite',
  fillEmpty: "Yes and don't overwrite",
  no: 'No',
} as const satisfies Record<string, UpdateFieldsOption>;
