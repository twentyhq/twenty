export const UNVERIFIABLE_SLACK_TEAM_ID_FAILURE = {
  success: false,
  message: 'Could not verify the Slack workspace for that user',
  error:
    'Slack did not confirm which workspace this user belongs to, so that team id cannot be accepted. Leave the team id blank to use the installed workspace.',
} as const;
