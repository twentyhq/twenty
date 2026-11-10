import { type CompleteGraphWidgetFieldSelection } from '@/page-layout/types/CompleteGraphWidgetFieldSelection';
import { type GraphWidgetFieldSelection } from '@/page-layout/types/GraphWidgetFieldSelection';
import { isDefined } from 'twenty-shared/utils';

export const isGraphWidgetFieldSelectionComplete = (
  fieldSelection: GraphWidgetFieldSelection,
): fieldSelection is CompleteGraphWidgetFieldSelection =>
  isDefined(fieldSelection.aggregateFieldMetadataId) &&
  isDefined(fieldSelection.groupByFieldMetadataId) &&
  isDefined(fieldSelection.groupByOrderBy);
