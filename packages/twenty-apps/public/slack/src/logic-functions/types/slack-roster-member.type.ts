export type SlackRosterMember = {
  id?: string;
  team_id?: string;
  is_bot?: boolean;
  deleted?: boolean;
  is_restricted?: boolean;
  is_ultra_restricted?: boolean;
  is_stranger?: boolean;
  is_email_confirmed?: boolean;
  real_name?: string;
  profile?: { display_name?: string; email?: string };
};

export type LinkableSlackRosterMember = SlackRosterMember & { id: string };
