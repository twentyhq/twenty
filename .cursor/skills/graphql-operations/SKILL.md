---
name: graphql-operations
description: Add or modify GraphQL queries, mutations, and fragments in twenty-front. Use when creating new GraphQL operations, updating fragments, running codegen, or wiring generated types into hooks.
---

# GraphQL Operations

**Purpose**: Step-by-step guide for adding or modifying GraphQL operations in the Twenty frontend, from fragment definition through codegen to hook consumption.

**When to use**: Any time you need to add a new query, mutation, or fragment, or modify an existing one.

---

## Two GraphQL Endpoints

Twenty has **two separate GraphQL APIs** with separate codegen configs:

| Endpoint | Codegen Config | Output | Typical Operations |
|----------|---------------|--------|-------------------|
| `/metadata` | `codegen-metadata.cjs` | `src/generated-metadata/graphql.ts` | Auth, users, views, roles, permissions, field metadata, object metadata, page layouts, AI, applications |
| `/graphql` | `codegen.cjs` | `src/generated/graphql.ts` | Workflows, activities, search, command-menu |

Most Omnia work uses the **metadata** endpoint.

---

## Directory Structure

GraphQL operations live inside the module that owns them:

```
packages/twenty-front/src/modules/{module}/
└── graphql/
    ├── fragments/
    │   └── {entityName}Fragment.ts      # or {entityName}Fragments.ts for multiple
    ├── queries/
    │   └── {operationName}.ts           # One query per file
    └── mutations/
        └── {operationName}.ts           # One mutation per file
```

Some modules use a flat `graphql/fragment.ts` or `graphql/queries.ts` when there are only a few operations.

---

## Step 1: Define or Update Fragments

Fragments are reusable field selections. Define them first since queries and mutations reference them.

**File**: `modules/{module}/graphql/fragments/{entityName}Fragment.ts`

```typescript
import { gql } from '@apollo/client';

export const MY_ENTITY_FRAGMENT = gql`
  fragment MyEntityFragment on MyEntity {
    id
    name
    createdAt
    updatedAt
  }
`;
```

**Naming conventions:**
- Export name: `SCREAMING_SNAKE_CASE` (e.g., `MY_ENTITY_FRAGMENT`)
- Fragment name in GraphQL: `PascalCase` + `Fragment` suffix (e.g., `MyEntityFragment`)
- File name: `camelCase` + `Fragment.ts` (e.g., `myEntityFragment.ts`)

**Multiple fragments in one file** — use when fragments are closely related:

```typescript
export const AUTH_TOKEN = gql`
  fragment AuthTokenFragment on AuthToken {
    token
    expiresAt
  }
`;

export const AUTH_TOKEN_PAIR = gql`
  ${AUTH_TOKEN}
  fragment AuthTokenPairFragment on AuthTokenPair {
    accessOrWorkspaceAgnosticToken {
      ...AuthTokenFragment
    }
    refreshToken {
      ...AuthTokenFragment
    }
  }
`;
```

**Composing fragments** — embed parent fragments with template literals:

```typescript
import { AUTH_TOKEN } from './authFragments';

export const SESSION_FRAGMENT = gql`
  ${AUTH_TOKEN}
  fragment SessionFragment on Session {
    tokens {
      ...AuthTokenFragment
    }
  }
`;
```

---

## Step 2: Define Queries

**File**: `modules/{module}/graphql/queries/{operationName}.ts`

```typescript
import { MY_ENTITY_FRAGMENT } from '@/{module}/graphql/fragments/myEntityFragment';
import { gql } from '@apollo/client';

export const FIND_MANY_MY_ENTITIES = gql`
  ${MY_ENTITY_FRAGMENT}
  query FindManyMyEntities($filter: MyEntityFilterInput) {
    getMyEntities(filter: $filter) {
      ...MyEntityFragment
    }
  }
`;
```

**Naming conventions:**
- Export name: `SCREAMING_SNAKE_CASE` (e.g., `FIND_MANY_MY_ENTITIES`, `GET_CURRENT_USER`)
- Operation name in GraphQL: `PascalCase` (e.g., `FindManyMyEntities`)
- File name: `camelCase.ts` matching the operation (e.g., `findManyMyEntities.ts`)
- One query per file

---

## Step 3: Define Mutations

**File**: `modules/{module}/graphql/mutations/{operationName}.ts`

```typescript
import { MY_ENTITY_FRAGMENT } from '@/{module}/graphql/fragments/myEntityFragment';
import { gql } from '@apollo/client';

export const CREATE_MY_ENTITY = gql`
  ${MY_ENTITY_FRAGMENT}
  mutation CreateMyEntity($input: CreateMyEntityInput!) {
    createMyEntity(input: $input) {
      ...MyEntityFragment
    }
  }
`;
```

**Naming conventions:**
- Same SCREAMING_SNAKE_CASE / PascalCase pattern as queries
- Common prefixes: `CREATE_`, `UPDATE_`, `DELETE_`, `UPSERT_`
- One mutation per file

---

## Step 4: Run Codegen

After adding or modifying any `.gql` or GraphQL template literals:

```bash
# For metadata endpoint operations (most common)
npx nx run twenty-front:graphql:generate --configuration=metadata

# For workspace/graphql endpoint operations
npx nx run twenty-front:graphql:generate

# Run both if unsure
npx nx run twenty-front:graphql:generate && npx nx run twenty-front:graphql:generate --configuration=metadata
```

This generates typed document nodes and TypeScript types in:
- `src/generated-metadata/graphql.ts` (metadata endpoint)
- `src/generated/graphql.ts` (workspace endpoint)

**After codegen, verify:**
- The generated file contains your new `Document` type (e.g., `FindManyMyEntitiesDocument`)
- Input/output types are generated (e.g., `CreateMyEntityInput`, `MyEntityFragment`)

---

## Step 5: Use in Hooks

### Query hook

```typescript
import { useQuery } from '@apollo/client/react';
import { FindManyMyEntitiesDocument } from '~/generated-metadata/graphql';

export const useMyEntities = (filter?: MyEntityFilter) => {
  const { data, loading, error } = useQuery(FindManyMyEntitiesDocument, {
    variables: { filter },
    skip: !filter,  // conditional execution
  });

  return {
    myEntities: data?.getMyEntities ?? [],
    loading,
    error,
  };
};
```

### Mutation hook

```typescript
import { useMutation } from '@apollo/client/react';
import {
  CreateMyEntityDocument,
  type CreateMyEntityInput,
} from '~/generated-metadata/graphql';

export const useCreateMyEntity = () => {
  const [createMyEntityMutation] = useMutation(CreateMyEntityDocument);

  const createMyEntity = async (input: CreateMyEntityInput) => {
    const { data } = await createMyEntityMutation({
      variables: { input },
    });
    return data?.createMyEntity;
  };

  return { createMyEntity };
};
```

**Import conventions:**
- Document types: `import { XxxDocument } from '~/generated-metadata/graphql'`
- Input types: `import type { XxxInput } from '~/generated-metadata/graphql'`
- Fragment types: `import type { XxxFragment } from '~/generated-metadata/graphql'`
- Use `type` imports for types that aren't used as runtime values

---

## Step 6: Verify Types

After wiring everything up:

```bash
npx nx typecheck twenty-front
```

---

## Modifying Existing Fragments

When adding a field to an existing fragment:

1. Find the fragment file (search for the fragment name)
2. Add the field to the fragment
3. Run codegen (Step 4)
4. All queries/mutations using that fragment automatically get the new field
5. Typecheck to find any components that need updating

**If the fragment is in `generated-metadata/graphql.ts`** — that file is auto-generated. Find the source `.ts` file that defines the `gql` template and modify there.

---

## Common Patterns

### Pagination

```typescript
export const FIND_MANY_PAGINATED = gql`
  ${MY_ENTITY_FRAGMENT}
  query FindManyPaginated($first: Int, $after: String) {
    getMyEntities(first: $first, after: $after) {
      edges {
        node {
          ...MyEntityFragment
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
```

### Variables with enums

```typescript
export const FIND_BY_STATUS = gql`
  query FindByStatus($status: MyEntityStatus!) {
    getMyEntities(status: $status) {
      id
      name
    }
  }
`;
```

### Refetching after mutation

```typescript
const [createEntity] = useMutation(CreateMyEntityDocument, {
  refetchQueries: [FindManyMyEntitiesDocument],
});
```

---

## Checklist

- [ ] Fragment defined with `PascalCase` + `Fragment` suffix
- [ ] Query/mutation export uses `SCREAMING_SNAKE_CASE`
- [ ] One operation per file (queries and mutations)
- [ ] Fragment imports use `@/` module path alias
- [ ] Codegen run for the correct endpoint (`--configuration=metadata` for metadata)
- [ ] Generated types imported from `~/generated-metadata/graphql` or `~/generated/graphql`
- [ ] Hook uses typed `Document` (not raw `gql` string) from generated output
- [ ] `npx nx typecheck twenty-front` passes
