// The lookbehind anchors the match to the start of a bracket run. Without it,
// every position inside a long run is a candidate start and the greedy + makes
// the scan quadratic in the run length; a run start always yields the same
// match, so no valid marker is lost.
export const CHAT_REFERENCE_OPEN_PATTERN = '(?<!\\[)\\[\\[+';
