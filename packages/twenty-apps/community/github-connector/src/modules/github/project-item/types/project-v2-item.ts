type FieldRef = { name: string };

export type ProjectV2FieldValue =
  | {
      __typename: 'ProjectV2ItemFieldSingleSelectValue';
      name: string;
      field: FieldRef;
    }
  | {
      __typename: 'ProjectV2ItemFieldIterationValue';
      title: string;
      field: FieldRef;
    }
  | {
      __typename: 'ProjectV2ItemFieldTextValue';
      text: string;
      field: FieldRef;
    }
  | {
      __typename: 'ProjectV2ItemFieldNumberValue';
      number: number;
      field: FieldRef;
    }
  | {
      __typename: 'ProjectV2ItemFieldUserValue';
      users: { nodes: Array<{ login: string }> };
      field: FieldRef;
    };

export type ProjectV2Item = {
  id: string;
  content: {
    __typename: string;
    title?: string;
    number?: number;
    url?: string;
    repository?: { nameWithOwner: string };
  } | null;
  fieldValues: {
    nodes: Array<ProjectV2FieldValue>;
  };
};
