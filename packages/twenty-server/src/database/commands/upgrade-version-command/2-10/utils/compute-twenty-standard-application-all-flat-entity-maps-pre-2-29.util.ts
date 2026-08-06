import { remapRecordPageUniversalIdentifiersToPre229 } from 'src/database/commands/upgrade-version-command/2-10/utils/remap-record-page-universal-identifiers-to-pre-2-29.util';
import { type TwentyStandardAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/types/twenty-standard-all-flat-entity-maps.type';
import {
  type ComputeTwentyStandardApplicationAllFlatEntityMapsArgs,
  computeTwentyStandardApplicationAllFlatEntityMaps,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

// Standard definitions for upgrade commands that predate the 2-29 record-page
// reconcile: they run on workspaces whose rows still hold the pre-derivation
// universal identifiers, so the derived identifiers the shared constants now
// resolve to are remapped back to the pre-2.29 literals.
export const computeTwentyStandardApplicationAllFlatEntityMapsPre229 = (
  args: ComputeTwentyStandardApplicationAllFlatEntityMapsArgs,
): TwentyStandardAllFlatEntityMaps => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps(args);

  return remapRecordPageUniversalIdentifiersToPre229(allFlatEntityMaps);
};
