export const RUN_TOOL_SCRIPT_LIMITS = {
  maxMemoryBytes: 64 * 1024 * 1024,
  maxFeedDurationSeconds: 30,
  maxToolCalls: 100,
  maxOutputStreamLength: 32 * 1024,
} as const;
