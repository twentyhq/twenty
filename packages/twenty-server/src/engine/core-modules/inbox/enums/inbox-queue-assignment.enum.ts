import { registerEnumType } from '@nestjs/graphql';

// Which part of a shared inbox is being read. A queue exists to answer "what
// has nobody picked up yet", so that is the default; the other two keep the
// team's whole picture reachable.
export enum InboxQueueAssignment {
  UNASSIGNED = 'UNASSIGNED',
  ASSIGNED = 'ASSIGNED',
  ALL = 'ALL',
}

registerEnumType(InboxQueueAssignment, { name: 'InboxQueueAssignment' });
