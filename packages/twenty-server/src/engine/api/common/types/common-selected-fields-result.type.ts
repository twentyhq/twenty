import { type CommonSelection } from 'src/engine/api/common/types/common-selection.type';

export interface CommonSelectedFields {
  [key: string]: boolean | CommonSelectedFields;
}

export type CommonSelectedFieldsResult = CommonSelection & {
  relationFieldsCount: number;
  hasAtLeastTwoNestedOneToManyRelations: boolean;
};
