import { isDefined } from 'twenty-shared/utils';

import {
  type CommonRelationSelection,
  type CommonRelationSelections,
} from 'src/engine/api/common/types/common-relation-selection.type';

export const getRelationSelectionEntries = (
  relationSelections: CommonRelationSelections,
): { responseKey: string; relationSelection: CommonRelationSelection }[] =>
  Object.entries(relationSelections).flatMap(
    ([responseKey, relationSelection]) =>
      isDefined(relationSelection) ? [{ responseKey, relationSelection }] : [],
  );
