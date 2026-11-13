export const getScopedRelationAlias = (viewFieldId: string) =>
  `scope_${viewFieldId.replaceAll('-', '')}`;
