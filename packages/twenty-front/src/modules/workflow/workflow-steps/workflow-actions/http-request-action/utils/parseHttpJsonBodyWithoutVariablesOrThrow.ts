import { removeVariablesFromJson } from '@/workflow/workflow-variables/utils/removeVariablesFromJson';

export const parseHttpJsonBodyWithoutVariablesOrThrow = (value: string) => {
  return JSON.parse(removeVariablesFromJson(value));
};
