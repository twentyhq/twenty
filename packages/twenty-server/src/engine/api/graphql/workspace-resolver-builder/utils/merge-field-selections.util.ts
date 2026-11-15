import isEqual from 'lodash.isequal';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { computeRelationRecordKey } from 'src/engine/api/common/utils/compute-relation-record-key.util';
import { SELECTION_ARGUMENTS } from 'src/engine/api/graphql/workspace-resolver-builder/constants/selection-arguments.constant';
import { SELECTION_FIELD_NAME } from 'src/engine/api/graphql/workspace-resolver-builder/constants/selection-field-name.constant';
import { SELECTION_RESPONSE_KEY } from 'src/engine/api/graphql/workspace-resolver-builder/constants/selection-response-key.constant';
import { type ResolverSelectedFields } from 'src/engine/api/graphql/workspace-resolver-builder/types/resolver-selected-fields.type';
import { getFieldSelections } from 'src/engine/api/graphql/workspace-resolver-builder/utils/get-field-selections.util';
import { getSelectionEntries } from 'src/engine/api/graphql/workspace-resolver-builder/utils/get-selection-entries.util';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';

const throwConflictingArguments = (responseKey: string): never => {
  throw new CommonQueryRunnerException(
    `Conflicting arguments for "${responseKey}": a response key reused under different aliases must request its field with the same arguments`,
    CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
    { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
  );
};

// One record value backs every response path of a slot, so differing arguments cannot be served
const mergeSelections = (
  selections: ResolverSelectedFields[],
): ResolverSelectedFields => {
  const merged: ResolverSelectedFields = Object.create(null);

  for (const selection of selections) {
    for (const {
      responseKey,
      fieldName,
      selection: childSelection,
    } of getSelectionEntries(selection)) {
      const slotKey = computeRelationRecordKey({ fieldName, responseKey });
      const existingSelection: ResolverSelectedFields | undefined =
        merged[slotKey];

      if (!isPlainObject(childSelection)) {
        merged[slotKey] = childSelection;
        continue;
      }

      if (
        isPlainObject(existingSelection) &&
        !isEqual(
          existingSelection[SELECTION_ARGUMENTS],
          childSelection[SELECTION_ARGUMENTS],
        )
      ) {
        throwConflictingArguments(responseKey);
      }

      const mergedChildSelection = mergeSelections(
        isPlainObject(existingSelection)
          ? [existingSelection, childSelection]
          : [childSelection],
      );

      if (responseKey !== fieldName) {
        mergedChildSelection[SELECTION_FIELD_NAME] = fieldName;
      }

      if (slotKey !== responseKey) {
        mergedChildSelection[SELECTION_RESPONSE_KEY] = responseKey;
      }

      if (isDefined(childSelection[SELECTION_ARGUMENTS])) {
        mergedChildSelection[SELECTION_ARGUMENTS] =
          childSelection[SELECTION_ARGUMENTS];
      }

      merged[slotKey] = mergedChildSelection;
    }
  }

  return merged;
};

// Aliases of a field whose data is not per alias (composites, edges, node) read the same values
export const mergeFieldSelections = ({
  selectedFields,
  fieldName,
}: {
  selectedFields: ResolverSelectedFields;
  fieldName: string;
}): ResolverSelectedFields =>
  mergeSelections(
    getFieldSelections({ selectedFields, fieldName }).map(
      ({ selection }) => selection,
    ),
  );
