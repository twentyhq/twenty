export type RelationFilterValue = {
  isCurrentWorkspaceMemberSelected?: boolean;
  selectedRecordIds: string[];
};

export type ViewFilterValue =
  | string
  | string[]
  | boolean
  | number
  | RelationFilterValue
  | Record<string, unknown>
  | null
  | undefined;
