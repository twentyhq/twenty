import { type GraphQLNamedType } from 'graphql';
import { expect, test } from 'vitest';

import { RenderContext } from '../../genql/render/common/RenderContext';
import { objectType } from '../../genql/render/typeMap/objectType';
import { scalarType } from '../../genql/render/typeMap/scalarType';
import { unionType } from '../../genql/render/typeMap/unionType';
import { type Type } from '../../genql/runtime/types';
import { toClientSchema } from './render-test-helpers';

// Port of remorses/genql@v3.0.5 cli/src/render/typeMap/index.test.ts. Upstream
// ran these with `output = true`, which skipped the assertions (a leftover
// "TODO readd tests") and let its expected values go stale: an argument's
// entry is `[namedType]`, with the wrapped type string appended only when it
// differs (e.g. `['Int', '[[[Int]]]']`), not always `[namedType, namedType]`.
// This port runs the assertions enabled, with the expected values corrected
// to the engine's actual (and upstream 3.0.5's actual) output.
type Renderer = (
  type: GraphQLNamedType,
  renderContext: RenderContext,
) => Type<string>;

const testCase = async (
  schemaGql: string,
  renderer: Renderer,
  cases: { [type: string]: Type<string> },
) => {
  const schema = await toClientSchema(schemaGql);

  const renderContext = new RenderContext(schema);

  for (const typeName in cases) {
    const type = schema.getType(typeName);
    const expected = cases[typeName];

    if (!type) {
      throw new Error(`type ${typeName} is not defined in the schema`);
    }

    expect(renderer(type, renderContext), typeName).toEqual(expected);
  }
};

test('scalarType', () =>
  testCase(
    /* GraphQL */ `
      enum Enum {
        some
        other
      }

      scalar Scalar

      type Query {
        scalar: String
        customScalar: Scalar
        enum: Enum
      }
    `,
    scalarType as Renderer,
    {
      String: {},
      Scalar: {},
      Enum: {},
    },
  ));

test('objectType', () =>
  testCase(
    /* GraphQL */ `
      interface Interface {
        some: String
      }

      type ImplementorA implements Interface {
        some: String
      }

      type ImplementorB implements Interface {
        some: String
      }

      type Object {
        scalar: Int
        object: Object
        interface: Interface
        optionalArgScalar(arg: Int): Int
        optionalArgObject(arg: Int): Object
        optionalArgInterface(arg: Int): Interface
        nestedArg(a: [[[Int]]], b: [[[Int!]!]!]!): Boolean
      }

      type ObjectWithoutScalar {
        object: Object
        interface: Interface
      }

      type Query {
        _: Boolean
      }
    `,
    objectType as Renderer,
    {
      Object: {
        scalar: { type: 'Int' },
        object: { type: 'Object' },
        interface: { type: 'Interface' },
        optionalArgScalar: {
          type: 'Int',
          args: { arg: ['Int'] },
        },
        optionalArgObject: {
          type: 'Object',
          args: { arg: ['Int'] },
        },
        optionalArgInterface: {
          type: 'Interface',
          args: { arg: ['Int'] },
        },
        nestedArg: {
          type: 'Boolean',
          args: {
            a: ['Int', '[[[Int]]]'],
            b: ['Int', '[[[Int!]!]!]!'],
          },
        },
        __typename: { type: 'String' },
      },
      Interface: {
        some: { type: 'String' },
        on_ImplementorA: { type: 'ImplementorA' },
        on_ImplementorB: { type: 'ImplementorB' },
        __typename: { type: 'String' },
      },
      ObjectWithoutScalar: {
        __typename: { type: 'String' },
        interface: { type: 'Interface' },
        object: { type: 'Object' },
      },
    },
  ));

test('unionType', () =>
  testCase(
    /* GraphQL */ `
      type Some {
        field: Int
      }

      type Other {
        field: Int
      }

      type Another {
        field: Int
      }

      union Union = Some | Other | Another

      type Query {
        _: Boolean
      }
    `,
    unionType as Renderer,
    {
      Union: {
        on_Some: { type: 'Some' },
        on_Other: { type: 'Other' },
        on_Another: { type: 'Another' },
        __typename: { type: 'String' },
      },
    },
  ));
