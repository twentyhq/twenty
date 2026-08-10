// how many records a reply may present: the prompt caps its record list at
// this many, and the worker renders one summary attachment per listed record.
// both sides read this constant so a reply can never list records the
// summaries silently drop.
export const SLACK_RECORD_SUMMARY_MAX_COUNT = 5;
