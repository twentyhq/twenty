import { expect, test } from 'vitest';

import { prettify } from '../../genql/helpers/prettify';
import { renderSchema } from '../../genql/render/schema/renderSchema';
import { schemaRenderTest } from './render-test-helpers';

// Port of remorses/genql@v3.0.5 cli/src/render/schema/renderSchema.test.ts;
// `prettify` is awaited since the prettier 3 migration made it async.
test('renderSchema', async () => {
  expect(
    await schemaRenderTest(
      /* GraphQL */ `
        type A {
          some: String
        }

        type B {
          some: String @deprecated
        }

        type Query {
          _: Boolean
        }
      `,
      renderSchema,
      'graphql',
    ),
  ).toBe(
    await prettify(
      /* GraphQL */ `
        type A {
          some: String
        }

        type B {
          some: String @deprecated
        }

        type Query {
          _: Boolean
        }
      `,
      'graphql',
    ),
  );
});
