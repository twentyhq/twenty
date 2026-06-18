export const UPDATE_FIELDS_OPTIONS = {
  overwrite: 'Yes and overwrite',
  fillEmpty: "Yes and don't overwrite",
  no: 'No',
} as const;

export type UpdateFieldsOption =
  (typeof UPDATE_FIELDS_OPTIONS)[keyof typeof UPDATE_FIELDS_OPTIONS];

export const UPDATE_FIELDS_OPTION_VALUES: UpdateFieldsOption[] =
  Object.values(UPDATE_FIELDS_OPTIONS);
