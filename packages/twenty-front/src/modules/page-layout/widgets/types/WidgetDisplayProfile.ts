// A widget's affinity decides whether it can be the sole full-bleed occupant of
// a tab. Module widgets (Timeline, Tasks, a record table...) are self-contained
// full-page experiences; card widgets (a field, a chart) are meant to sit inside
// a boxed layout even when alone.
export type WidgetAffinity = 'module' | 'card';

// In solo presentation, flow widgets render at their natural height and let the
// page scroll, while fill widgets take the whole viewport and scroll internally.
export type WidgetScrollStrategy = 'flow' | 'fill';

export type WidgetDisplayProfile = {
  affinity: WidgetAffinity;
  scrollStrategy: WidgetScrollStrategy;
};
