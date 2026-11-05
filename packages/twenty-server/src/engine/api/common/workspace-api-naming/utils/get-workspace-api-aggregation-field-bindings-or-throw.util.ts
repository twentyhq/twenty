import { AggregateOperations } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceApiNamingView } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-view.type';
import { assertWorkspaceApiNameAvailableOrThrow } from 'src/engine/api/common/workspace-api-naming/utils/assert-workspace-api-name-available-or-throw.util';
import { WorkspaceApiNamingException } from 'src/engine/api/common/workspace-api-naming/workspace-api-naming.exception';
import {
  type AggregationField,
  getAvailableAggregationsFromObjectFields,
} from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const getAggregationIdentity = ({
  universalIdentifier,
  aggregation,
}: {
  universalIdentifier: string;
  aggregation: AggregationField;
}): string =>
  JSON.stringify([
    universalIdentifier,
    aggregation.aggregateOperation,
    aggregation.fromSubFields,
    aggregation.subFieldForNumericOperation,
  ]);

export const getWorkspaceApiAggregationFieldBindingsOrThrow = ({
  fields,
  view,
}: {
  fields: FlatFieldMetadata[];
  view: WorkspaceApiNamingView;
}): Record<string, string> => {
  const bindings: Record<string, string> = { totalCount: 'totalCount' };
  const apiIdentitiesByName = new Map<string, string>();
  const canonicalIdentitiesByName = new Map<string, string>();

  for (const fieldMetadata of fields) {
    const canonicalNamesByIdentity = new Map<string, string>();

    for (const [name, aggregation] of Object.entries(
      getAvailableAggregationsFromObjectFields([fieldMetadata]),
    )) {
      if (aggregation.aggregateOperation === AggregateOperations.COUNT) {
        continue;
      }

      const identity = getAggregationIdentity({
        universalIdentifier: fieldMetadata.universalIdentifier,
        aggregation,
      });

      assertWorkspaceApiNameAvailableOrThrow({
        name,
        identity,
        identitiesByName: canonicalIdentitiesByName,
      });
      canonicalNamesByIdentity.set(identity, name);
    }

    const apiFieldMetadata = {
      ...fieldMetadata,
      name:
        view.fields[fieldMetadata.universalIdentifier] ?? fieldMetadata.name,
    };

    for (const [name, aggregation] of Object.entries(
      getAvailableAggregationsFromObjectFields([apiFieldMetadata]),
    )) {
      if (aggregation.aggregateOperation === AggregateOperations.COUNT) {
        continue;
      }

      const identity = getAggregationIdentity({
        universalIdentifier: fieldMetadata.universalIdentifier,
        aggregation,
      });
      const canonicalName = canonicalNamesByIdentity.get(identity);

      if (!isDefined(canonicalName)) {
        throw new WorkspaceApiNamingException(
          `Aggregation ${name} has no canonical field binding`,
        );
      }

      assertWorkspaceApiNameAvailableOrThrow({
        name,
        identity,
        identitiesByName: apiIdentitiesByName,
      });
      bindings[name] = canonicalName;
    }
  }

  return bindings;
};
