// One thing an item is about, as a producer describes it. The record pointer is
// optional: an email sender the workspace has never met is still worth naming.
export type InboxItemRecordDraft = {
  label: string;
  subtitle?: string;
  // How this relates to the entry before it, which is the only edge the pane
  // draws.
  relationLabel?: string;
  objectMetadataId?: string;
  recordId?: string;
};
