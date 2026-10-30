export const AGENT_CHAT_THREAD_PARTICIPANT_NEXT_UPDATED_AT = `GREATEST(clock_timestamp(), participant."updatedAt" + interval '1 millisecond')`;
