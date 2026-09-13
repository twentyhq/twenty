import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './no-miscased-acronym-in-message';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: 'const label = msg`Avatar URL`;',
      filename: 'compute-workspace-member.ts',
    },
    {
      code: 'const label = t`ACS URL copied to clipboard`;',
      filename: 'saml-form.tsx',
    },
    {
      code: "const label = msg({ message: `ID`, context: 'fieldMetadata.label' });",
      filename: 'compute-company.ts',
    },
    // The acronym is the tail of a field name the sentence is naming, so the
    // lowercase spelling is the correct one.
    {
      code: 'const message = msg`${fieldName} and ${fieldName}Id cannot be both provided.`;',
      filename: 'connect-query.ts',
    },
    {
      code: 'const label = t`Identity provider`;',
      filename: 'sso.tsx',
    },
    {
      code: 'const label = t`Urlaub buchen`;',
      filename: 'de.tsx',
    },
    // Not a message tag, so not this rule's business.
    {
      code: 'const query = sql`select Id from t`;',
      filename: 'query.ts',
    },
    {
      code: 'const heading = <div>Avatar Url</div>;',
      filename: 'header.tsx',
    },
  ],
  invalid: [
    {
      code: 'const label = msg`Avatar Url`;',
      errors: [{ messageId: 'miscasedAcronym' }],
      filename: 'compute-workspace-member.ts',
    },
    {
      code: 'const label = t`ACS Url`;',
      errors: [{ messageId: 'miscasedAcronym' }],
      filename: 'saml-form.tsx',
    },
    {
      code: 'const label = i18n.t`Redirect Url copied to clipboard`;',
      errors: [{ messageId: 'miscasedAcronym' }],
      filename: 'redirect.tsx',
    },
    {
      code: "const label = msg({ message: `Message Channel Id`, context: 'fieldMetadata.label' });",
      errors: [{ messageId: 'miscasedAcronym' }],
      filename: 'compute-message-channel.ts',
    },
    {
      code: "const label = msg({ message: 'Json object to provide steps' });",
      errors: [{ messageId: 'miscasedAcronym' }],
      filename: 'compute-workflow-version.ts',
    },
    {
      code: 'const label = i18n.t({ message: `Avatar Url` });',
      errors: [{ messageId: 'miscasedAcronym' }],
      filename: 'avatar.ts',
    },
    {
      code: 'const label = msg`Json value for event Id`;',
      errors: [
        { messageId: 'miscasedAcronym' },
        { messageId: 'miscasedAcronym' },
      ],
      filename: 'compute-timeline-activity.ts',
    },
    {
      code: 'const heading = <Trans>Avatar Url</Trans>;',
      errors: [{ messageId: 'miscasedAcronym' }],
      filename: 'avatar.tsx',
    },
    {
      code: 'const label = defineMessage`Last published Version Id`;',
      errors: [{ messageId: 'miscasedAcronym' }],
      filename: 'compute-workflow.ts',
    },
  ],
});
