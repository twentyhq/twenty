import { type PageLayoutTabManifest } from 'twenty-shared/application';

export type PageLayoutTabConfig = Omit<
  PageLayoutTabManifest,
  'pageLayoutUniversalIdentifier'
> & {
  pageLayoutUniversalIdentifier: string;
};
