import { type PageLayoutWidgetManifest } from 'twenty-shared/application';

export type PageLayoutWidgetConfig = Omit<
  PageLayoutWidgetManifest,
  'pageLayoutTabUniversalIdentifier'
> & {
  pageLayoutTabUniversalIdentifier: string;
};
