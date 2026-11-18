import { isDefined } from 'twenty-shared/utils';

import {
  type CommonRelationSelection,
  type CommonSelection,
} from 'src/engine/api/common/types/common-selection.type';

export const getRelationSelectionEntries = ({
  relations,
}: Pick<CommonSelection, 'relations'>): {
  key: string;
  relationSelection: CommonRelationSelection;
}[] =>
  Object.entries(relations).flatMap(([key, relationSelection]) =>
    isDefined(relationSelection) ? [{ key, relationSelection }] : [],
  );
