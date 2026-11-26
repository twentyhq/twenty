import { type TeamsAssistantStatusStep } from 'src/features/chat/logic-functions/types/teams-assistant-status-step.type';

export const TEAMS_ASSISTANT_INITIAL_STATUS = 'Thinking…';

export const TEAMS_ASSISTANT_STATUS_STEPS: TeamsAssistantStatusStep[] = [
  { afterSeconds: 30, text: 'Digging through your CRM…' },
  { afterSeconds: 90, text: 'Still on it, thanks for waiting…' },
  { afterSeconds: 150, text: 'This one is taking a while, still on it…' },
];
