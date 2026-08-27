import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

export const hasTimelineActivityObjectMetadata = ({
  byUniversalIdentifier,
}: {
  byUniversalIdentifier: Partial<Record<string, unknown>>;
}): boolean =>
  isDefined(
    byUniversalIdentifier[
      STANDARD_OBJECTS.timelineActivity.universalIdentifier
    ],
  );
