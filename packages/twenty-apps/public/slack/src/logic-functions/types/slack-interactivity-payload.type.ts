type SlackInteractionTeam = {
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
  actions?: SlackInteractionAction[];
};
