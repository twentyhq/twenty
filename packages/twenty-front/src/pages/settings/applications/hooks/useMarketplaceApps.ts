import { t } from '@lingui/core/macro';
import isEmpty from 'lodash.isempty';
import { useFindManyMarketplaceAppsQuery } from '~/generated/graphql';
import { type AvailableApplication } from '~/pages/settings/applications/types/availableApplication';

/* eslint-disable lingui/no-unlocalized-strings */
// eslint-disable-next-line twenty/no-hardcoded-colors
const DATA_ENRICHMENT_LOGO_SVG = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#1a2744"><ellipse cx="38" cy="20" rx="28" ry="10"/><rect x="10" y="20" width="56" height="50"/><ellipse cx="38" cy="70" rx="28" ry="10"/><ellipse cx="38" cy="35" rx="28" ry="10" fill="none" stroke="#fff" stroke-width="3"/><ellipse cx="38" cy="52" rx="28" ry="10" fill="none" stroke="#fff" stroke-width="3"/><circle cx="72" cy="62" r="22" fill="#1a2744"/><circle cx="72" cy="62" r="18" fill="#fff"/><path d="M72 50 L72 74 M62 58 L72 48 L82 58" stroke="#1a2744" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`)}`;

const MOCKED_MARKETPLACE_APP: AvailableApplication = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'Data Enrichment',
  description: 'Enrich your data easily. Choose your provider.',
  author: 'Cosmos Labs',
  logoPath: DATA_ENRICHMENT_LOGO_SVG,
  category: 'Data',
  aboutDescription:
    'Enhance your workspace with automated data intelligence. This app monitors your new records and automatically populates missing details such as job titles, company size, social profiles, and industry insights.',
  providers: ['Clearbit', 'Apollo', 'Hunter.io'],
  screenshots: [
    'https://placehold.co/800x400/f5f5f5/666?text=Screenshot+1',
    'https://placehold.co/800x400/f5f5f5/666?text=Screenshot+2',
    'https://placehold.co/800x400/f5f5f5/666?text=Screenshot+3',
    'https://placehold.co/800x400/f5f5f5/666?text=Screenshot+4',
    'https://placehold.co/800x400/f5f5f5/666?text=Screenshot+5',
  ],
  content: {
    objects: 3,
    fields: 12,
    widgets: 2,
    commands: 4,
  },
  version: '1.0.0',
  websiteUrl: 'https://cosmos-labs.io',
  termsUrl: 'https://cosmos-labs.io/terms',
};
/* eslint-enable lingui/no-unlocalized-strings */

export const useMarketplaceApps = () => {
  const { data, loading, error } = useFindManyMarketplaceAppsQuery();

  const apiApps: AvailableApplication[] =
    data?.findManyMarketplaceApps.map((app) => ({
      id: app.id,
      name: app.name,
      description: isEmpty(app.description)
        ? t`This app has no description for now.` // TODO decide design
        : app.description,
      author: app.author,
      logoPath: app.logo ?? '',
      category: app.category,
      aboutDescription: app.aboutDescription,
      providers: app.providers,
      screenshots: app.screenshots,
      content: {
        objects: 0,
        fields: 0,
        widgets: 0,
        commands: 0,
      },
      version: app.version,
      websiteUrl: app.websiteUrl ?? '',
      termsUrl: app.termsUrl ?? '',
    })) ?? [];

  const marketplaceApps: AvailableApplication[] = [
    MOCKED_MARKETPLACE_APP,
    ...apiApps,
  ];

  return {
    data: marketplaceApps,
    isLoading: loading,
    error,
  };
};
