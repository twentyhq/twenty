export type RecallBotStatusChange = {
  code: string;
  createdAt: string | undefined;
};

export type RecallBotRecording = {
  id: string | undefined;
  startedAt: string | undefined;
  completedAt: string | undefined;
};

// Typed view of a Recall bot payload, parsed once at the recall-api boundary
// so flows never handle raw provider records.
export type RecallBotSnapshot = {
  id: string | undefined;
  metadata: Record<string, unknown>;
  statusChanges: RecallBotStatusChange[];
  recordings: RecallBotRecording[];
};
