export type DefaultTimelineProjectionRule = {
  sourceObjectNameSingular: string;
  linkedObjectNameSingulars: string[];
};

// Applied to every non-person anchor on top of any workspace-defined rules: a
// company/opportunity inherits its related people's notes & tasks out of the box.
export const DEFAULT_TIMELINE_PROJECTION_RULES: DefaultTimelineProjectionRule[] =
  [
    {
      sourceObjectNameSingular: 'person',
      linkedObjectNameSingulars: ['note', 'task'],
    },
  ];
