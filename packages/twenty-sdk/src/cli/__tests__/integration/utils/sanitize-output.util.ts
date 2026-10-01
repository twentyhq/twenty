export const sanitizeOutput = (output: string): string => {
  return (
    output
      // Remove ANSI color codes
      .replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '')
      // Normalize file paths (replace any absolute path to a test app)
      .replace(/\/[^\s]+\/__tests__\/apps\/[^/]+/g, '<APP_PATH>')
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, '<TIMESTAMP>')
      .replace(/\d+ms/g, '<DURATION>')
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n')
      .trim()
  );
};
