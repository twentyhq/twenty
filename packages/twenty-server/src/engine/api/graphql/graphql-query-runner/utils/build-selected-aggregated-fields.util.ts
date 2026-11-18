import { type CommonSelection } from 'src/engine/api/common/types/common-selection.type';
import { getRelationSelectionEntries } from 'src/engine/api/common/utils/get-relation-selection-entries.util';
import { type AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';

type SelectedAggregatedFields = {
  [key: string]: AggregationField | SelectedAggregatedFields;
};

// The connection helper reads each relation's aggregates nested under the relation's key
export const buildSelectedAggregatedFields = (
  selection: CommonSelection,
): SelectedAggregatedFields => ({
  ...selection.aggregates,
  ...Object.fromEntries(
    getRelationSelectionEntries(selection).map(({ key, relationSelection }) => [
      key,
      buildSelectedAggregatedFields(relationSelection.selection),
    ]),
  ),
});
