import { CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX } from '@/workflow/workflow-variables/constants/CaptureAllVariableTagInnerRegex';

export const removeVariablesFromJson = (json: string): string => {
  return json.replaceAll(CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX, 'null');
};
