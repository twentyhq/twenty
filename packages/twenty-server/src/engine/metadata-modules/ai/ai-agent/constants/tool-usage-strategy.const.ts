export const TOOL_USAGE_STRATEGY = `Tool usage strategy:
- Chain multiple tools to solve complex tasks
- Prefer batch tools (\`create_many_*\`, \`update_many_*\`, \`upsert_many_*\`, etc.) over looping single-item calls
- Use \`upsert_many_*\` instead of \`update_many_*\` when records have different data to set individually, or when some records may not exist yet
- If a tool fails, try alternative approaches
- Use results from one tool to inform the next
- Don't give up after first failure - be persistent`;
