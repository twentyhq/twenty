import { useMemo } from 'react';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

export type RoadmapDependency = {
  __typename: string;
  id: string;
  dependentMilestoneId: string;
  requiredMilestoneId: string;
};

type UseRecordRoadmapDependenciesArgs = {
  /** Milestones currently rendered on the timeline. Dependencies are
      filtered to those whose dependent end is in this set, since edges
      whose endpoints are off-screen wouldn't paint anyway. */
  recordIds: string[];
  /** Skip the fetch when the underlying object isn't an
      OpportunityMilestone. Cheap guard so the Roadmap stays generic. */
  enabled: boolean;
};

// Fetches the OpportunityMilestoneDependency edges relevant to the
// currently-rendered milestones. Filter is on `dependentMilestoneId`
// because that's the side that matters for the arrow's destination —
// the `requiredMilestoneId` may belong to a different swimlane (cross-
// Opportunity dependencies) but its bar is still in `barLayouts` if
// it's on screen, so the connector still renders correctly.
export const useRecordRoadmapDependencies = ({
  recordIds,
  enabled,
}: UseRecordRoadmapDependenciesArgs): {
  dependencies: RoadmapDependency[];
  loading: boolean;
} => {
  const { records, loading } = useFindManyRecords<RoadmapDependency>({
    objectNameSingular: 'opportunityMilestoneDependency',
    filter:
      recordIds.length > 0
        ? { dependentMilestoneId: { in: recordIds } }
        : undefined,
    skip: !enabled || recordIds.length === 0,
    recordGqlFields: {
      id: true,
      dependentMilestoneId: true,
      requiredMilestoneId: true,
    },
  });

  const dependencies = useMemo<RoadmapDependency[]>(
    () =>
      records.map((record) => ({
        __typename: 'OpportunityMilestoneDependency',
        id: record.id,
        dependentMilestoneId: record.dependentMilestoneId,
        requiredMilestoneId: record.requiredMilestoneId,
      })),
    [records],
  );

  return { dependencies, loading };
};
