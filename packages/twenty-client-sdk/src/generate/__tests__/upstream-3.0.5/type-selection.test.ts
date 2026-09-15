import { describe, test } from 'vitest';

import { type FieldsSelection } from '../../genql/runtime/typeSelection';

// Port of remorses/genql@v3.0.5 cli/src/typeSelection.test.ts, the type-level
// contract of the runtime's FieldsSelection. Every test body is compile-time
// only (dontExecute); the assertions are the `@ts-expect-error` comments,
// enforced by the package typecheck. Upstream's fully commented-out blocks
// ("hide fields in request", the trailing union experiments) are not ported.
type SRC = {
  literalsUnion: 'a' | 'b';
  nullableField: null | { x: boolean; optional?: string };
  list: {
    x: number;
    a: string;
    optional?: string;
  }[];
  nested?: {
    list?: {
      edges?: {
        x?: number;
      }[];
    }[];
  };
  category: {
    a: Date;
    b: Date;
    c: Date;
    nested1: {
      a: string;
      b: string;
      c: string;
    };
    nested2: {
      a: string;
      b: string;
    };
    optionalFieldsNested?: {
      a?: string;
      b?: number;
    };
  };
  optionalFields: {
    a?: string;
    b?: number;
  };
  order: {
    customer: {
      address: {
        city: 1;
        a: 1;
        b: 1;
      };
    };
  };
  union:
    | { a: string; __isUnion?: true }
    | { a: string; b: string; __isUnion?: true };
  nesting: {
    nestedUnion:
      | { a: string; __isUnion?: true }
      | { a: string; b: string; __isUnion?: true };
  };
  xxx: {
    xxx: boolean;
  };
  yyy: {
    yyy: boolean;
  };
  argumentSyntax: {
    a: string;
    optional?: string;
    nesting: {
      x: number;
      y: number;
    };
    union:
      | { a: string; __isUnion?: true }
      | { a: string; b: string; __isUnion?: true };
    list: {
      x: number;
      a: string;
      optional?: string;
    }[];
  };
  argumentScalar?: string;
};

describe('pick', () => {
  const req = {
    category: {
      a: 1,
      b: 1,
      nested1: {
        a: 1,
      },
    },
    argumentSyntax: {
      __args: { x: 3 },
      a: 1,
      nesting: {
        __scalar: 1,
      },
    },
  };
  const z: FieldsSelection<SRC, NoExtraProperties<typeof req>> = {} as any;
  test(
    'response type picks from request type',
    dontExecute(() => {
      z.category;
      z.category.a;
      z.category.b;
      // @ts-expect-error c was not selected
      z.category.c;
      z.category.nested1.a;
    }),
  );
  test(
    'response type does not have additional properties',
    dontExecute(() => {
      // @ts-expect-error not selected
      z.order;
      // @ts-expect-error not selected
      z.category.nested1.b;
      // @ts-expect-error not selected
      z.category.nested1.c;
      // @ts-expect-error not selected
      z.category.nested2;
    }),
  );
  test(
    'argument syntax',
    dontExecute(() => {
      z.argumentSyntax.a.toLocaleLowerCase;
    }),
  );
});

describe('__scalar', () => {
  const req = {
    __name: 'name',
    category: {
      __scalar: 1,
      nested1: {
        a: 1,
      },
    },
    argumentSyntax: {
      __args: { a: 7 },
      __scalar: 1,
    },
    argumentScalar: {
      __args: { x: 9 },
    },
  };
  const z: FieldsSelection<SRC, typeof req> = {} as any;
  test(
    'response type picks from request type',
    dontExecute(() => {
      z.category;
      z.category.a;
      z.category.b;
      z.category.c;
      z.category.nested1.a;
      z.category.a.getDate;
      z.category.b.getDate;
    }),
  );
  test(
    'response type does not have additional properties',
    dontExecute(() => {
      // @ts-expect-error not selected
      z.order;
      // @ts-expect-error not selected
      z.category.nested1.b;
      // @ts-expect-error not selected
      z.category.nested1.c;
      // @ts-expect-error not selected
      z.category.nested2;
    }),
  );
  test(
    '__scalar is not present',
    dontExecute(() => {
      // @ts-expect-error __scalar is stripped from the response
      z.category.__scalar;
    }),
  );
  test(
    '__name is not present',
    dontExecute(() => {
      // @ts-expect-error __name is stripped from the response
      z.__name;
    }),
  );
  test(
    'argument syntax',
    dontExecute(() => {
      z.argumentSyntax.a.toLocaleLowerCase;
      z.argumentSyntax.optional?.big;
      // @ts-expect-error nesting is not a scalar, __scalar does not select it
      z.argumentSyntax.nesting.x;
    }),
  );
  test(
    'argument syntax on scalar',
    dontExecute(() => {
      z.argumentScalar;
      z.argumentScalar?.charAt;
      // @ts-expect-error not a string property
      z.argumentScalar.xx;
    }),
  );
});

describe('optional fields', () => {
  const req = {
    optionalFields: {
      a: 1,
      b: 1,
    },
    category: {
      optionalFieldsNested: {
        __scalar: 1,
      },
    },
    argumentSyntax: {
      optional: 1,
    },
  };
  const z: FieldsSelection<SRC, typeof req> = {} as any;
  test(
    'optional fields are preserved',
    dontExecute(() => {
      // @ts-expect-error optional
      z.optionalFields.a.toLocaleLowerCase;
      z.optionalFields.a?.toLocaleLowerCase;
      // @ts-expect-error optional
      z.optionalFields.b.toLocaleLowerCase;
      z.optionalFields.b?.toFixed;
      // @ts-expect-error optional
      z.category.optionalFieldsNested.a;
      // @ts-expect-error optional
      z.category?.optionalFieldsNested.a;
    }),
  );
  test(
    'optional fields are preserved in __scalar',
    dontExecute(() => {
      // @ts-expect-error optional
      z.optionalFields.a.toLocaleLowerCase;
      z.optionalFields.a?.toLocaleLowerCase;
      // @ts-expect-error optional
      z.optionalFields.b.toLocaleLowerCase;
      z.optionalFields.b?.toFixed;
      // @ts-expect-error optional
      z.category.optionalFieldsNested.a;
      z.category.optionalFieldsNested?.a?.toLocaleLowerCase;
    }),
  );
  test(
    'argument syntax',
    dontExecute(() => {
      // @ts-expect-error optional
      z.argumentSyntax.optional.toLocaleLowerCase;
      z.argumentSyntax.optional?.toLocaleLowerCase;
    }),
  );
});

describe('unions', () => {
  const req = {
    union: {
      onX: {
        a: 1,
        __scalar: 1,
      },
    },
    nesting: {
      nestedUnion: {
        onX: {
          a: 1,
        },
        onY: {
          b: 1,
        },
      },
    },
    argumentSyntax: {
      union: {
        a: 1,
        onX: {
          b: 1,
        },
      },
    },
  };
  const z: FieldsSelection<SRC, typeof req> = {} as any;
  test(
    'pick union fields',
    dontExecute(() => {
      z.union.a.toLocaleLowerCase;
      z.union.a.toLocaleLowerCase;
      z.nesting.nestedUnion.a.toLocaleLowerCase;
    }),
  );
  test(
    'does not have __isUnion',
    dontExecute(() => {
      // @ts-expect-error __isUnion is stripped from the response
      z.union.__isUnion;
      // @ts-expect-error __isUnion is stripped from the response
      z.nesting.nestedUnion.__isUnion;
    }),
  );
  test(
    'argument syntax',
    dontExecute(() => {
      z.argumentSyntax.union.a.charAt;
      // @ts-expect-error a was not selected on argumentSyntax
      z.argumentSyntax.a;
    }),
  );
});

describe('arrays', () => {
  const req = {
    list: {
      a: 1,
      x: 1,
      optional: 1,
    },
    nested: {
      __args: { x: 1 },
      __scalar: 1,
      list: {
        edges: {
          x: 1,
        },
      },
    },
    argumentSyntax: {
      list: {
        x: 1,
        optional: 1,
      },
    },
  };
  const z: FieldsSelection<SRC, typeof req> = {} as any;
  test(
    'list',
    dontExecute(() => {
      z.list[0].a.charCodeAt;
      z.list[0].x.toFixed;
    }),
  );
  test(
    'nested',
    dontExecute(() => {
      z.nested?.list?.[0]?.edges?.[0].x?.toFixed;
    }),
  );
  test(
    'maintain optionals',
    dontExecute(() => {
      // @ts-expect-error optional
      z.list[0].optional.bold;
      z.list[0].optional?.bold;
    }),
  );
  test(
    'args syntax',
    dontExecute(() => {
      z.argumentSyntax.list[0].x;
      z.argumentSyntax.list[0].optional?.charAt;
      // @ts-expect-error optional
      z.argumentSyntax.list[0].optional.charAt;
    }),
  );
});

describe('literals unions', () => {
  const req = {
    literalsUnion: 1,
  };
  const z: FieldsSelection<SRC, typeof req> = {} as any;
  test(
    'literals',
    dontExecute(() => {
      z.literalsUnion.blink;
      z.literalsUnion === 'a';
      z.literalsUnion === 'b';
      // @ts-expect-error not a member of the literals union
      z.literalsUnion === 'x';
    }),
  );
});

describe('nullable fields', () => {
  const req = {
    nullableField: {
      x: 1,
      optional: 1,
    },
  };
  const z: FieldsSelection<SRC, typeof req> = {} as any;
  test(
    'accessible',
    dontExecute(() => {
      z.nullableField.x;
      z.nullableField.optional?.big;
      // @ts-expect-error optional
      z.nullableField.optional.big;
    }),
  );
});

test(
  'complex optional type with array',
  dontExecute(() => {
    interface ForkConnection {
      edges?: (ForkEdge | undefined)[];
      __typename?: 'ForkConnection';
    }

    interface ForkEdge {
      cursor?: string;
      node?: { x: string; y: string };
      nodes?: { x?: string; y?: string }[];
      __typename?: 'ForkEdge';
    }

    type X = FieldsSelection<
      ForkConnection | undefined,
      {
        edges?: {
          node: {
            x: 1;
          };
          nodes: {
            __scalar: 1;
          };
        };
      }
    >;
    const x: X = {} as any;
    x?.edges?.[0]?.node?.x?.toLocaleLowerCase;
    // @ts-expect-error y was not selected
    x?.edges?.[0]?.node?.y?.toLocaleLowerCase;
    x?.edges?.[0]?.nodes?.[0].x?.toLocaleLowerCase;
    x?.edges?.[0]?.nodes?.[0].y?.toLocaleLowerCase;
  }),
);

function dontExecute(_f: () => void) {
  return () => {};
}

type Impossible<TKeys extends keyof any> = {
  [TKey in TKeys]: never;
};

type NoExtraProperties<
  TObject,
  TExtended extends TObject = TObject,
> = TExtended & Impossible<Exclude<keyof TExtended, keyof TObject>>;
