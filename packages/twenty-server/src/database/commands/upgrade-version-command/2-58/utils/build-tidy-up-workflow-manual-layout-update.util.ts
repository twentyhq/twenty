import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';

export const TIDY_UP_WORKFLOW_UNIVERSAL_IDENTIFIER =
  '1f3a3cab-161a-4775-af47-11be4d0bf411';

export const PREVIOUS_TIDY_UP_WORKFLOW_AVAILABILITY_EXPRESSION =
  'pageType == "RECORD_PAGE" and everyDefined(selectedRecords, "currentVersion.trigger") and everyDefined(selectedRecords, "currentVersion.steps") and every(selectedRecords, "currentVersion.steps.length") and noneDefined(selectedRecords, "deletedAt") and noneEquals(selectedRecords, "recordPermissions.canUpdate", false)';

export const MANUAL_LAYOUT_TIDY_UP_WORKFLOW_AVAILABILITY_EXPRESSION =
  'pageType == "RECORD_PAGE" and everyDefined(selectedRecords, "currentVersion.trigger") and everyDefined(selectedRecords, "currentVersion.steps") and every(selectedRecords, "currentVersion.steps.length") and every(selectedRecords, "currentVersion.hasManualLayout") and noneDefined(selectedRecords, "deletedAt") and noneEquals(selectedRecords, "recordPermissions.canUpdate", false)';

export const buildTidyUpWorkflowManualLayoutUpdate = ({
  flatCommandMenuItemMaps,
  now,
}: {
  flatCommandMenuItemMaps: Pick<
    FlatEntityMaps<FlatCommandMenuItem>,
    'byUniversalIdentifier'
  >;
  now: string;
}): FlatCommandMenuItem | undefined => {
  const tidyUpCommandMenuItem =
    flatCommandMenuItemMaps.byUniversalIdentifier[
      TIDY_UP_WORKFLOW_UNIVERSAL_IDENTIFIER
    ];

  if (
    !isDefined(tidyUpCommandMenuItem) ||
    tidyUpCommandMenuItem.applicationUniversalIdentifier !==
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER ||
    tidyUpCommandMenuItem.conditionalAvailabilityExpression !==
      PREVIOUS_TIDY_UP_WORKFLOW_AVAILABILITY_EXPRESSION
  ) {
    return undefined;
  }

  return {
    ...tidyUpCommandMenuItem,
    conditionalAvailabilityExpression:
      MANUAL_LAYOUT_TIDY_UP_WORKFLOW_AVAILABILITY_EXPRESSION,
    isPinned: true,
    shortLabel: null,
    updatedAt: now,
  };
};
