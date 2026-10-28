export const CRM_HYGIENE_SKILL_CONTENT_BEFORE_MERGE_TOOL = `# CRM Hygiene Skill

Audit records for problems, show the user what you found, and fix only what they approve.

## Audit

Ask which object to audit if the user has not said. Then look for these, in this order:

- **Duplicates.** Read the object's duplicateCriteria from its metadata and search on those fields. Two companies sharing a domain, or two people sharing an email, are the reliable cases.
- **Missing fields.** Identify the fields that make a record useful for that object, then count how many records leave them empty.
- **Stale records.** Records untouched for a long time, especially opportunities whose close date has passed while they are still open.
- **Broken links.** Records whose expected relation is empty, such as a person with no company or a deal with no contact.

Use group_by_* to count rather than reading every record, then fetch only the rows you intend to show.

## Report

Lead with counts, so the user sees the shape of the problem before the detail. Then list the worst cases, referencing each record. Say which fix you propose for each group and what it would change.

## Fix

Always confirm before writing. Show what you will change and wait.

- You cannot merge records. There is no merge tool; merging happens in the UI, where the user selects the records and uses the Merge action. Report each duplicate pair with both records referenced and leave the merge to them.
- Fill missing fields only from data already in the workspace, never from a guess.
- Apply approved changes in one call rather than one record at a time. These tools carry the object's plural name: update_many_people, upsert_many_companies, and so on. Use update_many_* when every matched record gets the same value, upsert_many_* when each record needs its own.
- Report what changed afterwards, and say what you deliberately left alone.

## Rules

- Never delete a record in this skill, and never fake a merge by copying fields across and deleting the loser.
- Never confirm on the user's behalf, and never read a general yes as approval for a second batch.
- If there is nothing wrong, say so. A clean workspace is a valid result.`;
