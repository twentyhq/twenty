// One visible unsubscribe topic and whether a given address has opted out
// of it (a per-topic UNSUBSCRIBE suppression exists). Drives the public
// preferences page checkboxes: checked = not opted out.
export type TopicOptOutState = {
  unsubscribeTopicId: string;
  topicName: string | null;
  optedOut: boolean;
};
