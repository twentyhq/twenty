// Shared budget for inlining a tool result. Above this, outputs are spilled to
// a file (see the "Large tool output spill" plan) and navigated via the output
// navigation tools. ~16 KB is roughly 4k tokens (~4-5% of a 100k context window).
export const MAX_INLINE_TOOL_OUTPUT_BYTES = 16000;

export const OUTPUT_NAVIGATION_TOOL_NAMES = [
  'extract_json_paths',
  'search_output',
] as const;

export const DEFAULT_EXTRACT_MAX_ITEMS = 20;
export const DEFAULT_EXTRACT_MAX_DEPTH = 5;

export const DEFAULT_SEARCH_MAX_MATCHES = 10;
export const DEFAULT_SEARCH_CONTEXT_LINES = 2;

export const MAX_LEAF_STRING_LENGTH = 1000;
export const MAX_SEARCH_LINE_LENGTH = 500;
