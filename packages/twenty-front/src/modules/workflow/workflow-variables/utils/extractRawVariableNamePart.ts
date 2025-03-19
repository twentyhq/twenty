import { CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX } from '@/workflow/workflow-variables/constants/CaptureAllVariableTagInnerRegex';
import { isDefined } from 'twenty-shared/utils';

export const extractRawVariableNamePart = ({
  rawVariableName,
  part,
}: {
  rawVariableName: string;
  part: 'stepId' | 'selectedField';
}) => {
  const variableWithoutBrackets = rawVariableName.replace(
    CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
    (_, variableName) => {
      return variableName;
    },
  );

  const parts = variableWithoutBrackets.split('.');

  const extractedPart =
    part === 'stepId'
      ? parts.at(0)
      : part === 'selectedField'
        ? parts.at(-1)
        : null;

  if (!isDefined(extractedPart)) {
    throw new Error('Expected to find at least one splitted chunk.');
  }

  return extractedPart;
};
