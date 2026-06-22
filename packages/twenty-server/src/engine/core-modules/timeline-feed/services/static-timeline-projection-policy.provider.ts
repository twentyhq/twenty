import { Injectable } from '@nestjs/common';

// A projection rule: an anchor record inherits the timeline activities of the
// records reachable at `targetObjectNameSingular`, restricted to the activity
// object types in `linkedObjectNameSingulars`. `targetColumnName` is the morph
// column those inherited rows are stored under on the timelineActivity table.
export type TimelineProjectionRule = {
  targetObjectNameSingular: string;
  targetColumnName: string;
  linkedObjectNameSingulars: string[];
};

// The static policy: a company/opportunity inherits the notes & tasks of its
// related people. This is the seam — a workspace-configured provider can later
// replace it (backed by a TimelineSourceRule metadata entity + a Settings
// "Timeline" section) without touching the resolver or the service.
@Injectable()
export class StaticTimelineProjectionPolicyProvider {
  getRules(): TimelineProjectionRule[] {
    return [
      {
        targetObjectNameSingular: 'person',
        targetColumnName: 'targetPersonId',
        linkedObjectNameSingulars: ['note', 'task'],
      },
    ];
  }
}
