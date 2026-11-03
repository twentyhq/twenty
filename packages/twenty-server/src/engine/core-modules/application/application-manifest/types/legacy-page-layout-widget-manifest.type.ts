import { type NormalizedPageLayoutWidgetManifest } from 'twenty-shared/application';

export type LegacyPageLayoutWidgetManifest = Omit<
  NormalizedPageLayoutWidgetManifest,
  'conditionalDisplay'
> & {
  conditionalDisplay?:
    | NormalizedPageLayoutWidgetManifest['conditionalDisplay']
    | Record<string, unknown>;
};
