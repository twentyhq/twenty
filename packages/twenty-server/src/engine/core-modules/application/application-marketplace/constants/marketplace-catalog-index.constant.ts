export type CuratedAppEntry = {
  universalIdentifier: string;
  sourcePackage: string;
  isFeatured: boolean;
  name: string;
  description: string;
  author: string;
  logoUrl?: string;
  websiteUrl?: string;
  termsUrl?: string;
  latestAvailableVersion?: string;
};

const MOCK_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#1a2744"><ellipse cx="38" cy="20" rx="28" ry="10"/><rect x="10" y="20" width="56" height="50"/><ellipse cx="38" cy="70" rx="28" ry="10"/><ellipse cx="38" cy="35" rx="28" ry="10" fill="none" stroke="#fff" stroke-width="3"/><ellipse cx="38" cy="52" rx="28" ry="10" fill="none" stroke="#fff" stroke-width="3"/><circle cx="72" cy="62" r="22" fill="#1a2744"/><circle cx="72" cy="62" r="18" fill="#fff"/><path d="M72 50 L72 74 M62 58 L72 48 L82 58" stroke="#1a2744" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
const ENCODED_MOCK_LOGO = `data:image/svg+xml,${encodeURIComponent(MOCK_LOGO_SVG)}`;

export const MARKETPLACE_CATALOG_INDEX: CuratedAppEntry[] = [
  {
    universalIdentifier: 'a1b2c3d4-0000-0000-0000-000000000001',
    sourcePackage: '@twentyhq/app-data-enrichment',
    isFeatured: true,
    name: 'Data Enrichment',
    description: 'Enrich your data easily. Choose your provider.',
    author: 'Twenty',
    logoUrl: ENCODED_MOCK_LOGO,
    websiteUrl: 'https://twenty.com',
    latestAvailableVersion: '1.0.0',
  },
];
