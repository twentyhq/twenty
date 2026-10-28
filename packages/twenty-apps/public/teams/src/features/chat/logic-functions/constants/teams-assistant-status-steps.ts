export const TEAMS_ASSISTANT_INITIAL_STATUS = 'Thinking…';

export const TEAMS_ASSISTANT_STATUS_STEPS: {
  afterSeconds: number;
  text: string;
}[] = [
  { afterSeconds: 30, text: 'Digging through your CRM…' },
  { afterSeconds: 90, text: 'Still on it, thanks for waiting…' },
  { afterSeconds: 180, text: 'Wrapping up…' },
];
