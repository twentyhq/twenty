// Third-party password managers ignore the autocomplete attribute and only honor their own opt-outs
export const PASSWORD_MANAGER_IGNORE_ATTRIBUTES = {
  'data-1p-ignore': true,
  'data-lpignore': 'true',
  'data-bwignore': true,
  'data-form-type': 'other',
} as const;
