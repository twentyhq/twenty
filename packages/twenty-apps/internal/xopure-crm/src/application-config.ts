import { defineApplication } from 'twenty-sdk/define';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/roles/default-role';

export const APPLICATION_UNIVERSAL_IDENTIFIER =
  'ce8ec254-f99a-4e12-b23c-8ea97880a30b';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'XO Pure CRM',
  description:
    'Customer, ambassador, orders, commissions, prospects, sequences, and enrichment operations for XO Pure.',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  applicationVariables: {
    XOPURE_SYNC_WEBHOOK_SECRET: {
      universalIdentifier: 'c57b0aad-9743-4b9e-8bc2-172178c018b3',
      description: 'Shared secret expected on Supabase webhook calls into Twenty.',
      value: '',
      isSecret: true,
    },
    XOPURE_ENRICHMENT_PROVIDER: {
      universalIdentifier: 'b51f2252-1291-43e5-9c7b-a065555bb34b',
      description: 'Contact enrichment provider identifier used by enrichment jobs.',
      value: 'manual',
      isSecret: false,
    },
  },
});
