import { getEditDistance } from 'twenty-shared/workflow';

const MAX_TOOL_NAME_SUGGESTIONS = 3;

// Tool names follow an `<operation>_<object>` shape (e.g. group_by_people). The
// agent almost always keeps the operation and only slips on the object's
// singular/plural form, so we reward a longer shared prefix to keep the
// same-operation candidate ahead of a closer-but-different-operation one.
const PREFIX_MATCH_WEIGHT = 0.5;

const getCommonPrefixLength = (left: string, right: string): number => {
  const maxLength = Math.min(left.length, right.length);
  let index = 0;

  while (index < maxLength && left[index] === right[index]) {
    index++;
  }

  return index;
};

// Best-effort "did you mean" suggestions for a tool name the agent failed to
// resolve. Mostly catches singular/plural mix-ups (e.g. group_by_person ->
// group_by_people) so the model can recover without another discovery round-trip.
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
    // Skip exact matches and scale tolerance to the candidate length, mirroring
    // the workflow variable-path suggestion heuristic.
    .filter(
      ({ candidate, distance }) =>
        distance > 0 && distance <= Math.ceil(candidate.length / 2),
    )
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
