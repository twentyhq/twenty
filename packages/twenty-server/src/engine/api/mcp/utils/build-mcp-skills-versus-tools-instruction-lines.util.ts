export const buildMcpSkillsVersusToolsInstructionLines = (
  toolsExecutionLine: string,
): string[] => [
  `Skills vs Tools:`,
  `  Skills = documentation (load_skills) — teach HOW to do something, correct schemas and patterns`,
  toolsExecutionLine,
  `  For complex tasks (workflows, metadata), load the matching skill BEFORE calling tools.`,
  `  ⚠️ Never call workflow or metadata tools without loading their skill first.`,
];
