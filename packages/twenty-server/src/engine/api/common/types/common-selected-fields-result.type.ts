interface SelectedFields {
  [key: string]: boolean | SelectedFields;
}

export type CommonSelectedFieldsResult = {
  select: SelectedFields;
  relations: SelectedFields;
  aggregate: SelectedFields;
};
