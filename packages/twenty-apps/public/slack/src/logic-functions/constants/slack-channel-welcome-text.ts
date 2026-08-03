export const SLACK_CHANNEL_WELCOME_TEXT = [
  ":wave: Hi! I'm Twenty, your CRM in this channel.",
  "Mention me here or send me a DM and I'll answer in the thread: pipeline questions, company and contact lookups, creating and updating records, capturing notes and tasks.",
  'Details on how I work and what I can see are in the thread. Ask me anything.',
].join('\n\n');

export const SLACK_CHANNEL_WELCOME_THREAD_TEXT = [
  '**A few things to ask me**',
  [
    '- **Look things up**: "how many open opportunities are in the pipeline?", "who owns the ACME account?"',
    '- **Create and update records**: "add ACME as a company", "move the ACME deal to Proposal"',
    '- **Capture notes and tasks**: "note that ACME wants a security review", "task Alice with sending the pricing deck"',
  ].join('\n'),
  '**How I work with your data**',
  [
    "- I only act when you mention me, or in a thread I've already replied in. Channel threads stay open to me for 24 hours after my last reply",
    '- When you mention me I read recent messages in that thread for context',
    "- I can read, create, update and archive people, companies, opportunities, notes and tasks. I can't permanently delete anything and I can't change workspace settings",
  ].join('\n'),
].join('\n\n');
