export const formatExamples = (examples: string[]) =>
  `\nExamples:\n${examples.map((example) => `  ${example}`).join('\n')}\n`;
