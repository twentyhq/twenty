import { isNonEmptyString } from '@sniptt/guards';
import { type FindManyTimelineActivityTypesQuery } from '~/generated-metadata/graphql';

type TimelineActivityType =
  FindManyTimelineActivityTypesQuery['timelineActivityTypes'][number];

export const findRelationTimelineActivityType = ({
  timelineActivityTypes,
  relationFieldUniversalIdentifier,
  action,
}: {
  timelineActivityTypes: TimelineActivityType[];
  relationFieldUniversalIdentifier: string | undefined;
  action: string;
}): TimelineActivityType | undefined =>
  timelineActivityTypes.find((timelineActivityType) => {
    const emittedRelationFieldUniversalIdentifier =
      timelineActivityType.emit?.through?.relationFieldUniversalIdentifier;

    // Both identifiers are checked for presence because a type emitting on
    // every record carries no relation, and a field created in this session
    // carries no universal identifier yet: comparing the two absent values
    // would bind this toggle to an unrelated type.
    return (
      isNonEmptyString(emittedRelationFieldUniversalIdentifier) &&
      isNonEmptyString(relationFieldUniversalIdentifier) &&
      emittedRelationFieldUniversalIdentifier ===
        relationFieldUniversalIdentifier &&
      timelineActivityType.emit?.on === action
    );
  });
