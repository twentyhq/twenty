---
name: syncable-entity-testing
description: Create comprehensive integration tests for syncable entities in Twenty. Use when writing integration tests for metadata entities, covering validator exceptions, input transpilation errors, and CRUD operations. Tests are MANDATORY for all syncable entities.
---

# Syncable Entity: Integration Testing (Step 6/6 - MANDATORY)

**Purpose**: Create comprehensive test suite covering all validation scenarios, input transpilation exceptions, and successful use cases.

**When to use**: After completing Steps 1-5. Integration tests are **REQUIRED** for all syncable entities.

---

## Quick Start

Tests must cover:
1. **Failing scenarios** - All validator exceptions and input transpilation errors
2. **Successful scenarios** - All CRUD operations and edge cases
3. **Test utilities** - Reusable query factories and helper functions

**Test pattern**: Two-file pattern (query factory + wrapper) for each operation.

---

## Step 1: Create Test Utilities

### Pattern: Query Factory

**File**: `test/integration/metadata/suites/my-entity/utils/create-my-entity-query-factory.util.ts`

```typescript
import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { type CreateMyEntityInput } from 'src/engine/metadata-modules/my-entity/dtos/create-my-entity.input';

export type CreateMyEntityFactoryInput = CreateMyEntityInput;

const DEFAULT_MY_ENTITY_GQL_FIELDS = `
  id
  name
  label
  description
  isCustom
  createdAt
  updatedAt
`;

export const createMyEntityQueryFactory = ({
  input,
  gqlFields = DEFAULT_MY_ENTITY_GQL_FIELDS,
}: PerformMetadataQueryParams<CreateMyEntityFactoryInput>) => ({
  query: gql`
    mutation CreateMyEntity($input: CreateMyEntityInput!) {
      createMyEntity(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
```

### Pattern: Wrapper Utility

**File**: `test/integration/metadata/suites/my-entity/utils/create-my-entity.util.ts`

```typescript
import {
  type CreateMyEntityFactoryInput,
  createMyEntityQueryFactory,
} from 'test/integration/metadata/suites/my-entity/utils/create-my-entity-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { type MyEntityDto } from 'src/engine/metadata-modules/my-entity/dtos/my-entity.dto';

export const createMyEntity = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<CreateMyEntityFactoryInput>): CommonResponseBody<{
  createMyEntity: MyEntityDto;
}> => {
  const graphqlOperation = createMyEntityQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'My entity creation should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'My entity creation has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
```

**Required utilities** (follow same pattern):
- `update-my-entity-query-factory.util.ts` + `update-my-entity.util.ts`
- `delete-my-entity-query-factory.util.ts` + `delete-my-entity.util.ts`

---

## Step 2: Failing Creation Tests

**File**: `test/integration/metadata/suites/my-entity/failing-my-entity-creation.integration-spec.ts`

```typescript
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createMyEntity } from 'test/integration/metadata/suites/my-entity/utils/create-my-entity.util';
import { deleteMyEntity } from 'test/integration/metadata/suites/my-entity/utils/delete-my-entity.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';
import { type CreateMyEntityInput } from 'src/engine/metadata-modules/my-entity/dtos/create-my-entity.input';

type TestContext = {
  input: CreateMyEntityInput;
};

type GlobalTestContext = {
  existingEntityLabel: string;
  existingEntityName: string;
};

const globalTestContext: GlobalTestContext = {
  existingEntityLabel: 'Existing Test Entity',
  existingEntityName: 'existingTestEntity',
};

type CreateMyEntityTestingContext = EachTestingContext<TestContext>[];

describe('My entity creation should fail', () => {
  let existingEntityId: string | undefined;

  beforeAll(async () => {
    // Setup: Create entity for uniqueness tests
    const { data } = await createMyEntity({
      expectToFail: false,
      input: {
        name: globalTestContext.existingEntityName,
        label: globalTestContext.existingEntityLabel,
      },
    });

    existingEntityId = data.createMyEntity.id;
  });

  afterAll(async () => {
    // Cleanup
    if (isDefined(existingEntityId)) {
      await deleteMyEntity({
        expectToFail: false,
        input: { id: existingEntityId },
      });
    }
  });

  const failingMyEntityCreationTestCases: CreateMyEntityTestingContext = [
    // Input transpilation validation
    {
      title: 'when name is missing',
      context: {
        input: {
          label: 'Entity Missing Name',
        } as CreateMyEntityInput,
      },
    },
    {
      title: 'when label is missing',
      context: {
        input: {
          name: 'entityMissingLabel',
        } as CreateMyEntityInput,
      },
    },
    {
      title: 'when name is empty string',
      context: {
        input: {
          name: '',
          label: 'Empty Name Entity',
        },
      },
    },

    // Validator business logic
    {
      title: 'when name already exists (uniqueness)',
      context: {
        input: {
          name: globalTestContext.existingEntityName,
          label: 'Duplicate Name Entity',
        },
      },
    },
    {
      title: 'when trying to create standard entity',
      context: {
        input: {
          name: 'myEntity',
          label: 'Standard Entity',
          isCustom: false,
        } as CreateMyEntityInput,
      },
    },

    // Foreign key validation
    {
      title: 'when parentEntityId does not exist',
      context: {
        input: {
          name: 'invalidParentEntity',
          label: 'Invalid Parent Entity',
          parentEntityId: '00000000-0000-0000-0000-000000000000',
        },
      },
    },
  ];

  it.each(eachTestingContextFilter(failingMyEntityCreationTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await createMyEntity({
        expectToFail: true,
        input: context.input,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
```

**Test coverage requirements**:
- ✅ Missing required fields
- ✅ Empty strings
- ✅ Invalid format
- ✅ Uniqueness violations
- ✅ Standard entity protection
- ✅ Foreign key validation

---

## Step 3: Successful Creation Tests

**File**: `test/integration/metadata/suites/my-entity/successful-my-entity-creation.integration-spec.ts`

```typescript
import { createMyEntity } from 'test/integration/metadata/suites/my-entity/utils/create-my-entity.util';
import { deleteMyEntity } from 'test/integration/metadata/suites/my-entity/utils/delete-my-entity.util';
import { type CreateMyEntityInput } from 'src/engine/metadata-modules/my-entity/dtos/create-my-entity.input';

describe('My entity creation should succeed', () => {
  let createdEntityId: string;

  afterEach(async () => {
    if (createdEntityId) {
      await deleteMyEntity({
        expectToFail: false,
        input: { id: createdEntityId },
      });
    }
  });

  it('should create entity with minimal required input', async () => {
    const { data } = await createMyEntity({
      expectToFail: false,
      input: {
        name: 'minimalEntity',
        label: 'Minimal Entity',
      },
    });

    createdEntityId = data?.createMyEntity?.id;

    expect(data.createMyEntity).toMatchObject({
      id: expect.any(String),
      name: 'minimalEntity',
      label: 'Minimal Entity',
      description: null,
      isCustom: true,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('should create entity with all optional fields', async () => {
    const input = {
      name: 'fullEntity',
      label: 'Full Entity',
      description: 'Entity with all fields specified',
    } as const satisfies CreateMyEntityInput;

    const { data } = await createMyEntity({
      expectToFail: false,
      input,
    });

    createdEntityId = data?.createMyEntity?.id;

    expect(data.createMyEntity).toMatchObject({
      id: expect.any(String),
      name: 'fullEntity',
      label: 'Full Entity',
      description: 'Entity with all fields specified',
      isCustom: true,
    });
  });

  it('should sanitize input by trimming whitespace', async () => {
    const { data } = await createMyEntity({
      expectToFail: false,
      input: {
        name: '  entityWithSpaces  ',
        label: '  Entity With Spaces  ',
        description: '  Description with spaces  ',
      },
    });

    createdEntityId = data?.createMyEntity?.id;

    expect(data.createMyEntity).toMatchObject({
      id: expect.any(String),
      name: 'entityWithSpaces',
      label: 'Entity With Spaces',
      description: 'Description with spaces',
    });
  });

  it('should handle long text content', async () => {
    const longDescription = 'A'.repeat(1000);

    const { data } = await createMyEntity({
      expectToFail: false,
      input: {
        name: 'longDescEntity',
        label: 'Long Description Entity',
        description: longDescription,
      },
    });

    createdEntityId = data?.createMyEntity?.id;

    expect(data.createMyEntity).toMatchObject({
      id: expect.any(String),
      description: longDescription,
    });
  });
});
```

**Test coverage requirements**:
- ✅ Minimal required input
- ✅ All optional fields
- ✅ Input sanitization
- ✅ Long text content
- ✅ Special characters

---

## Step 4: Update and Delete Tests

Create similar test files for update and delete operations:

**Required files**:
- `failing-my-entity-update.integration-spec.ts`
- `successful-my-entity-update.integration-spec.ts`
- `failing-my-entity-deletion.integration-spec.ts`
- `successful-my-entity-deletion.integration-spec.ts`

---

## Testing Best Practices

### Pattern: Cleanup
```typescript
afterEach(async () => {
  if (createdEntityId) {
    await deleteMyEntity({
      expectToFail: false,
      input: { id: createdEntityId },
    });
  }
});
```

### Pattern: Type-Safe Inputs
```typescript
const input = {
  name: 'myEntity',
  label: 'My Entity',
} as const satisfies CreateMyEntityInput;
```

### Pattern: Snapshot Testing
```typescript
expectOneNotInternalServerErrorSnapshot({
  errors,
});
```

---

## Running Tests

```bash
# Run all entity tests
npx jest test/integration/metadata/suites/my-entity --config=packages/twenty-server/jest.config.mjs

# Run specific test file
npx jest test/integration/metadata/suites/my-entity/failing-my-entity-creation.integration-spec.ts --config=packages/twenty-server/jest.config.mjs

# Update snapshots
npx jest test/integration/metadata/suites/my-entity --updateSnapshot --config=packages/twenty-server/jest.config.mjs
```

---

## Complete Test Checklist

### Test Utilities
- [ ] `create-my-entity-query-factory.util.ts` created
- [ ] `create-my-entity.util.ts` created
- [ ] `update-my-entity-query-factory.util.ts` created
- [ ] `update-my-entity.util.ts` created
- [ ] `delete-my-entity-query-factory.util.ts` created
- [ ] `delete-my-entity.util.ts` created

### Failing Tests Coverage
- [ ] Missing required fields
- [ ] Empty string validation
- [ ] Uniqueness violations
- [ ] Standard entity protection
- [ ] Foreign key validation
- [ ] JSONB property validation (if applicable)

### Successful Tests Coverage
- [ ] Create with minimal input
- [ ] Create with all optional fields
- [ ] Input sanitization (whitespace)
- [ ] Long text content
- [ ] Update single field
- [ ] Update multiple fields
- [ ] Successful deletion

### Snapshot Tests
- [ ] All failing tests use `expectOneNotInternalServerErrorSnapshot`
- [ ] Snapshots committed to `__snapshots__/` directory

---

## Success Criteria

Your integration tests are complete when:

✅ All test utilities created (minimum 6 files)
✅ Failing creation tests cover all validators
✅ Failing update tests cover business rules
✅ Failing deletion tests cover protection rules
✅ Successful tests cover all use cases
✅ All snapshots generated and committed
✅ All tests pass consistently
✅ Test coverage meets requirements (>80%)

---

## Final Step

✅ **Step 6 Complete!** → Your syncable entity is fully tested and production-ready!

**Congratulations!** You've successfully created a new syncable entity in Twenty's workspace migration system.

For complete workflow, see `@creating-syncable-entity` rule.
