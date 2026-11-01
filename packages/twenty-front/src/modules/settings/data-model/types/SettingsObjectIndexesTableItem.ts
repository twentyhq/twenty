import { type IndexType } from '~/generated-metadata/graphql';

export type SettingsObjectIndexesTableItem = {
  id: string;
  name: string;
  indexType: IndexType;
  isUnique: boolean;
  isCustom: boolean;
  indexWhereClause?: string | null;
  indexFields: string;
};
