export type FieldsConfigurationGroupDragData = {
  type: 'group';
  groupId: string;
  index: number;
};

// Catches drops below the last group to append the dragged group at the end.
export type FieldsConfigurationGroupListEndDropData = {
  type: 'group-list-end';
};

export type FieldsConfigurationFieldDragData = {
  type: 'field';
  groupId: string;
  index: number;
};

// Catches drops below the last field of a list and drops into an empty group.
export type FieldsConfigurationFieldListEndDropData = {
  type: 'field-list-end';
  groupId: string;
};

export type FieldsConfigurationDndData =
  | FieldsConfigurationGroupDragData
  | FieldsConfigurationGroupListEndDropData
  | FieldsConfigurationFieldDragData
  | FieldsConfigurationFieldListEndDropData;
