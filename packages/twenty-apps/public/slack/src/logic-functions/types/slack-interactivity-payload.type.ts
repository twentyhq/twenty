type SlackInteractionTeam = {
  id?: string;
};

type SlackInteractionUser = {
  id?: string;
};

type SlackInteractionAction = {
  type?: string;
  action_id?: string;
  block_id?: string;
  value?: string;
  action_ts?: string;
};

export type SlackInteractivityPayload = {
  type?: string;
  team?: SlackInteractionTeam;
  user?: SlackInteractionUser;
  actions?: SlackInteractionAction[];
};
