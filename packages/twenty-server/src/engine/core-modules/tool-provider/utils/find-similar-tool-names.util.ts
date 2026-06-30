import { getEditDistance } from 'twenty-shared/workflow';

const MAX_TOOL_NAME_SUGGESTIONS = 3;
const PREFIX_MATCH_WEIGHT = 0.5;

const getCommonPrefixLength = (left: string, right: string): number => {
  const maxLength = Math.min(left.length, right.length);
  let index = 0;

  while (index < maxLength && left[index] === right[index]) {
    index++;
  }

  return index;
};

export const findSimilarToolNames = (
  toolName: string,
  candidateToolNames: string[],
): string[] =>
  candidateToolNames
    .map((candidate) => ({
      candidate,
      distance: getEditDistance(toolName, candidate),
      prefixLength: getCommonPrefixLength(toolName, candidate),
    }))
    .filter(
      ({ candidate, distance }) =>
        distance > 0 && distance <= Math.ceil(candidate.length / 2),
    )
    // Reward a shared operation prefix so the same-operation candidate (the
    // correct plural form) ranks ahead of a closer-but-different operation.
    .sort((left, right) => {
      const leftScore = left.distance - PREFIX_MATCH_WEIGHT * left.prefixLength;
      const rightScore =
        right.distance - PREFIX_MATCH_WEIGHT * right.prefixLength;

      return (
        leftScore - rightScore || left.candidate.localeCompare(right.candidate)
      );
    })
    .slice(0, MAX_TOOL_NAME_SUGGESTIONS)
    .map(({ candidate }) => candidate);
