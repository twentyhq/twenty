type SlackInteractionTeam = {
  id?: string;
};

type SlackInteractionUser = {
  id?: string;
};

type SlackInteractionAction = {
  action_id?: string;
  block_id?: string;
  value?: string;
};

export type SlackInteractivityPayload = {
  type?: string;
  team?: SlackInteractionTeam;
  user?: SlackInteractionUser;
  response_url?: string;
  actions?: SlackInteractionAction[];
};
