export type RightDrawerWorkflowView =
  | {
      type: 'select-action';
    }
  | {
      type: 'edit-action';
      nodeId: string;
    };
