import { isDefined } from 'twenty-shared/utils';
import {
  EngineComponentKey,
  type CommandMenuItemFieldsFragment,
} from '~/generated-metadata/graphql';

// The engine provisions a "Go to {objectLabelPlural}" command for every object it
// creates. At that point an object cannot be known to be a junction -- it has no
// fields yet, and a junction carries no marker of its own -- so junction objects
// get a navigation command pointing at an index page they do not have. Those
// entries do nothing when clicked, so they are dropped once the relation graph is
// resolved and the junction targets are actually known.
export const isCommandMenuItemNavigatingToJunctionObject = ({
  commandMenuItem,
  junctionObjectMetadataIds,
}: {
  commandMenuItem: Pick<
    CommandMenuItemFieldsFragment,
    'engineComponentKey' | 'navigationTargetObjectMetadataId'
  >;
  junctionObjectMetadataIds: Set<string>;
}): boolean =>
  commandMenuItem.engineComponentKey === EngineComponentKey.NAVIGATION &&
  isDefined(commandMenuItem.navigationTargetObjectMetadataId) &&
  junctionObjectMetadataIds.has(
    commandMenuItem.navigationTargetObjectMetadataId,
  );
