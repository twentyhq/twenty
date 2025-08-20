export type RelationFilterValue = {
  isCurrentWorkspaceMemberSelected?: boolean;
  selectedRecordIds: string[];
};

export type ViewFilterValue =
  | string
  | string[]
  | RelationFilterValue
  | Record<string, unknown>
  | null
  | undefined;
