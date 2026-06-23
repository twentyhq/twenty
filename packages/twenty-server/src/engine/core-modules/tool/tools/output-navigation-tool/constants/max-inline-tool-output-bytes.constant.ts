// Shared budget for inlining a tool result. Above this, outputs are spilled to
// a file and navigated via the output
// navigation tools. ~16 KB is roughly 4k tokens (~4-5% of a 100k context window).
export const MAX_INLINE_TOOL_OUTPUT_BYTES = 16000;
