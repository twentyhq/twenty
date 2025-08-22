import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

type FeatureFlagMetadata = {
  label: string;
  description: string;
  imagePath: string;
};

export type PublicFeatureFlag = {
  key: FeatureFlagKey;
  metadata: FeatureFlagMetadata;
};

export const PUBLIC_FEATURE_FLAGS: PublicFeatureFlag[] = [
  {
    key: FeatureFlagKey.IS_IMAP_SMTP_CALDAV_ENABLED,
    metadata: {
      label: 'IMAP, SMTP, CalDAV',
      description:
        'Easily add email accounts from any provider that supports IMAP, send emails with SMTP (and soon, sync calendars with CalDAV)',
      imagePath:
        'https://twenty.com/images/lab/is-imap-smtp-caldav-enabled.png',
    },
  },
  {
    key: FeatureFlagKey.IS_WORKFLOW_BRANCH_ENABLED,
    metadata: {
      label: 'Workflow Branches',
      description: 'Create multiple branches on your workflows',
      imagePath: 'https://twenty.com/images/lab/is-workflow-branch-enabled.png',
    },
  },
  ...(process.env.CLOUDFLARE_API_KEY
    ? [
        // {
        // Here you can add cloud only feature flags
        // },
      ]
    : []),
];
