import { describe, expect, expectTypeOf, it } from 'vitest';

import { prettify } from '../../genql/helpers/prettify';
import {
  enumSomeEnum,
  everything,
  generateQueryOp,
  generateSubscriptionOp,
} from './fixture/generated';

// Port of remorses/genql@v3.0.5 integration-tests/tests/simple.ts ("generate
// queries") onto vitest: mocha `describe/it` and snap-shot-it snapshots become
// vitest snapshots, tsd's `expectType` becomes `expectTypeOf`. The selections
// and test names are upstream's, unchanged.
describe('generate queries', () => {
  it('enum string is present', () => {
    expectTypeOf(enumSomeEnum.X).toEqualTypeOf<'X'>();
    expect(enumSomeEnum.X).toBe('X');
    expect(enumSomeEnum.Y).toBe('Y');
  });

  it('query', async () => {
    const { query } = generateQueryOp({
      repository: {
        __args: {
          name: 'repo',
          owner: 'owner',
        },
        createdAt: true,
        forks: {
          edges: {
            cursor: true,
            node: {
              ...everything,
            },
          },
        },
      },
    });
    expect(await prettify(query, 'graphql')).toMatchSnapshot();
  });

  it('optional arg', async () => {
    const { query } = generateQueryOp({
      optionalArgs: {
        createdAt: true,
        forks: {
          edges: {
            cursor: true,
            node: {
              ...everything,
            },
          },
        },
      },
    });
    expect(await prettify(query, 'graphql')).toMatchSnapshot();
  });

  it('recursive type', async () => {
    const { query } = generateQueryOp({
      recursiveType: {
        value: 1,
        recurse: {
          ...everything,
          recurse: {
            value: 1,
            recurse: {
              ...everything,
              recurse: {
                ...everything,
              },
            },
          },
        },
      },
    });
    expect(await prettify(query, 'graphql')).toMatchSnapshot();
  });

  it('recursive type with args', async () => {
    const { query } = generateQueryOp({
      recursiveType: {
        __args: { requiredVal: ['ciao'] },
        value: 1,
        recurse: {
          __args: {
            arg: 1,
          },
          ...everything,
          recurse: {
            __args: {
              arg: 1,
            },
            value: 1,
            recurse: {
              __args: {
                arg: 1,
              },
              ...everything,
              recurse: {
                ...everything,
              },
            },
          },
        },
      },
    });
    expect(await prettify(query, 'graphql')).toMatchSnapshot();
  });

  it('use __name operation name', async () => {
    const NAME = 'SomeName';
    const { query } = generateSubscriptionOp({
      __name: NAME,
      user: {
        __scalar: true,
      },
    });
    expect(await prettify(query, 'graphql')).toMatchSnapshot();
  });

  it('subscriptions', async () => {
    const { query } = generateSubscriptionOp({
      user: {
        __scalar: true,
      },
    });
    expect(await prettify(query, 'graphql')).toMatchSnapshot();
  });

  it('many', async () => {
    const { query } = generateQueryOp({
      repository: {
        __args: {
          name: 'repo',
          owner: 'owner',
        },
        createdAt: true,
        forks: {
          edges: {
            cursor: true,
            node: {
              ...everything,
            },
          },
        },
      },
      user: {
        ...everything,
      },
    });
    expect(await prettify(query, 'graphql')).toMatchSnapshot();
  });

  it('do not fetch falsy fields', async () => {
    const { query } = generateSubscriptionOp({
      user: {
        common: false,
        name: true,
      },
    });
    expect(await prettify(query, 'graphql')).toMatchSnapshot();
  });

  it('do not fetch falsy fields with __scalar', async () => {
    const { query } = generateSubscriptionOp({
      user: {
        common: false,
        __scalar: true,
      },
    });
    expect(await prettify(query, 'graphql')).toMatchSnapshot();
  });
});
