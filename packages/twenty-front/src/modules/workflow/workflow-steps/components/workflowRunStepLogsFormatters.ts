// Shared formatters and constants for the `WorkflowRunStepLogs*` family of
// components. Kept in a plain `.ts` file so it can be imported from both
// component files and the sibling `workflowRunStepLogsStyles.ts` without
// pulling in JSX.

// SF Mono ships with macOS and is preferred for code-like content; the
// stack falls back to Monaco/Consolas-style faces on other platforms.
export const MONOSPACE_FONT_FAMILY = `'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace`;

export const formatDuration = (ms: number): string => {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  return `${(ms / 1000).toFixed(1)}s`;
};

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
