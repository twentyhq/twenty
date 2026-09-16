import { type AccountBriefActivity } from 'src/logic-functions/domain/account-brief-activity.type';

const MAX_ACTIVITIES_IN_PROMPT = 100;

// Keeps the LLM input small: only the fields the synthesizer needs, oldest
// first so the brief reads chronologically.
export const buildAccountBriefPrompt = (
  recordDisplayName: string,
  activities: AccountBriefActivity[],
): string => {
  const serialized = activities
    .slice(-MAX_ACTIVITIES_IN_PROMPT)
    .map((activity) => ({
      name: activity.name,
      happensAt: activity.happensAt,
      properties: activity.properties,
    }));

  return JSON.stringify({
    account: recordDisplayName,
    activityCount: activities.length,
    activities: serialized,
  });
};
