import { defineApplication } from 'twenty-sdk/define';

import {
  APP_ABOUT_DESCRIPTION,
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/modules/shared/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  aboutDescription: APP_ABOUT_DESCRIPTION,
  icon: 'IconBrandGithub',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  screenshots: [
    'public/screenshots/app-listing.png',
    'public/screenshots/github-dashboard.png',
    'public/screenshots/pull-requests-view.png',
    'public/screenshots/contributor-stats.png',
  ],
  applicationVariables: {
    GITHUB_TOKEN: {
      universalIdentifier: 'fb1d2e91-3a75-4c89-9d6b-1e2f7a4c5d8e',
      description:
        'Fine-grained Personal Access Token (github_pat_…) from https://github.com/settings/personal-access-tokens — needs Read-only access to Contents, Issues, Pull requests and Metadata (and Organization → Projects for Projects v2). Classic PATs are not supported. When set, takes precedence over the GitHub App credentials below.',
      isSecret: true,
    },
    GITHUB_APP_ID: {
      universalIdentifier: '2a196d91-4c1b-4f8d-bc34-6693fcdaa771',
      description:
        'GitHub App ID. Used together with GITHUB_APP_PRIVATE_KEY and GITHUB_APP_INSTALLATION_ID when GITHUB_TOKEN is unset.',
      isSecret: false,
    },
    GITHUB_APP_PRIVATE_KEY: {
      universalIdentifier: 'c5591dd4-f653-4b92-bec9-970ddc8e10cc',
      description: 'GitHub App PEM private key (BEGIN/END PRIVATE KEY block).',
      isSecret: true,
    },
    GITHUB_APP_INSTALLATION_ID: {
      universalIdentifier: '0c39a59a-ee2e-49a9-88c7-3fbe6cb04ad0',
      description: 'GitHub App installation ID for your org.',
      isSecret: false,
    },
    GITHUB_WEBHOOK_SECRET: {
      universalIdentifier: 'b9f3c2d8-1e7a-4d56-9c8b-3a2f1e5d7c9a',
      description:
        'Shared secret used to verify the X-Hub-Signature-256 HMAC on incoming GitHub webhooks. When unset, signature verification is skipped (use only in dev/test).',
      isSecret: true,
    },
    GITHUB_REPOS: {
      universalIdentifier: '7d1e9c84-2f63-4a58-9b0d-5e8a3c1f7b29',
      description:
        'Comma-separated list of `owner/repo` to sync (e.g. `twentyhq/twenty,octo/hello`). Used by the manual fetch routes.',
      isSecret: false,
    },
    GITHUB_PROJECTS: {
      universalIdentifier: 'e3a8c7d2-4b95-4e1f-8a6c-9d2b5f7e1c84',
      description:
        'Comma-separated list of GitHub Projects (v2) to sync. Each entry is `owner/number` (e.g. `twentyhq/24,octo/3`). Owner can be an organization or a user. Full URLs like `https://github.com/orgs/twentyhq/projects/24` or `https://github.com/users/octo/projects/3` are also accepted.',
      isSecret: false,
    },
  },
});
