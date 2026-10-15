import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { LEGACY_WORKFLOW_RUN_WORKFLOW_VERSION_FIELD_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-48/constants/legacy-workflow-run-workflow-version-universal-identifiers.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps.util';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';

export const findStandardWorkflowRunIndexWorkflowVersionViewFields = ({
  flatViewMaps,
  flatViewFieldMaps,
}: Pick<
  AllFlatEntityMaps,
  'flatViewMaps' | 'flatViewFieldMaps'
>): FlatViewField[] => {
  const flatView =
    flatViewMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.workflowRun.views.allWorkflowRuns.universalIdentifier
    ];

  if (!isDefined(flatView)) {
    return [];
  }

  return findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps({
    flatEntityMaps: flatViewFieldMaps,
    universalIdentifiers: flatView.viewFieldUniversalIdentifiers,
  }).filter(
    (flatViewField) =>
      flatViewField.fieldMetadataUniversalIdentifier ===
        LEGACY_WORKFLOW_RUN_WORKFLOW_VERSION_FIELD_UNIVERSAL_IDENTIFIER &&
      flatViewField.applicationUniversalIdentifier ===
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  );
};
