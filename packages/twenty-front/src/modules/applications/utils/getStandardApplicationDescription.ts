import { t } from '@lingui/core/macro';

export const getStandardApplicationDescription =
  (): string => t`The base data model every Twenty workspace runs on.

#### What "foundation" means

Every Twenty workspace starts with this set of objects. They define the shape of your CRM, including relationships, activity, and reporting. Everything else, including marketplace apps, AI agents, and custom objects, plugs into them.

#### Included objects
- **People & Companies**: contact and account records
- **Opportunities**: your sales pipeline
- **Notes & Tasks**: activity and follow-ups
- **Workflows & Dashboards**: automation and reporting

Remove this app and the rest of Twenty has nothing to hang off.

#### Build your own app

Extend Twenty with your own objects, fields, logic functions, or AI skills. Create an app with the Twenty CLI:

\`\`\`bash
npm install -g twenty
twenty app init my-twenty-app
\`\`\`

Then inside the folder:

\`\`\`bash
cd my-twenty-app
yarn install
twenty auth login --url https://your-workspace.twenty.com
twenty app apply --create
twenty app dev
\`\`\`

See the [Getting Started guide](https://twenty.com/developers/extend/apps/getting-started) for the full walkthrough, and [Building Apps](https://twenty.com/developers/extend/apps/building) for the \`defineApplication\` / \`defineEntity\` APIs.`;
