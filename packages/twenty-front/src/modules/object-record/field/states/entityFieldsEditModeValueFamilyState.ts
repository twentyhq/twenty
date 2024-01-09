import { atomFamily } from 'recoil';

export const entityFieldsEditModeValueFamilyState = atomFamily<
  Record<string, unknown> | null,
  string
>({
  key: 'entityFieldsEditModeValueFamilyState',
  default: null,
});
