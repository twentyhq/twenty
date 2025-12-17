# PR: Add `containsJsonb` filter for `additionalEmails` with case-insensitive matching

## 🎯 Summary

This PR adds the ability to filter records by checking if a specific value exists in JSONB array fields like `additionalEmails`. It also ensures case-insensitive matching for email fields, consistent with how emails are stored.

**Related Issue:** Filtering People by `additionalEmails` array returns error instead of matching records.

## 🐛 Problems

### Problem 1: Missing filter operator

When trying to filter People records by checking if a specific email exists in the `additionalEmails` array field via GraphQL API, users received an error:

```
Field "containsJsonb" is not defined by type "RawJsonFilter"
```

The `additionalEmails` field is stored as a JSONB array (type `RAW_JSON`), but the `RawJsonFilter` only supported `is` (null check) and `like` operators. There was no operator to check if a value exists in the JSONB array.

### Problem 2: Case-sensitivity mismatch

Emails are normalized to lowercase when stored (via `transformEmailsValue`), but PostgreSQL's `@>` operator is case-sensitive. This means a filter like `containsJsonb: "Test@Example.Com"` would not match a stored email `test@example.com`, leading to incorrect empty results.

## ✅ Solution

### 1. Added `containsJsonb` operator

Added a new `containsJsonb` operator that uses PostgreSQL's JSONB containment operator (`@>`).

### 2. Case-insensitive email matching

The `containsJsonb` operator normalizes the value to lowercase **only for email fields** (`additionalEmails` within `EMAILS` type). This ensures:
- Email searches are case-insensitive (matching user expectations)
- Other JSONB fields remain case-sensitive (preserving generic behavior)

### Files Changed

| File | Changes |
|------|---------|
| `packages/twenty-server/src/engine/api/graphql/workspace-schema-builder/graphql-types/input/raw-json-filter.input-type.ts` | Added `containsJsonb` field to GraphQL input type |
| `packages/twenty-server/src/engine/api/graphql/graphql-query-runner/utils/compute-where-condition-parts.ts` | Added SQL handling for `containsJsonb` operator with email-specific lowercase normalization |
| `packages/twenty-shared/src/types/RecordGqlOperationFilter.ts` | Added `containsJsonb` to `RawJsonFilter` TypeScript type |
| `packages/twenty-server/src/engine/core-modules/record-crud/zod-schemas/field-filters.zod-schema.ts` | Added `additionalEmails` filter with `containsJsonb` for REST API |

### Implementation Details

The `containsJsonb` operator generates the following SQL:
```sql
"tableName"."columnName" @> :value::jsonb
```

Where `value` is serialized as a JSON array containing the search term: `["email@example.com"]`

For email fields specifically, the value is normalized to lowercase before the query:

```typescript
case 'containsJsonb': {
  // Normalize to lowercase only for email fields (emails are stored lowercase)
  const isEmailField =
    fieldMetadataType === FieldMetadataType.EMAILS &&
    subFieldKey === 'additionalEmails';
  const normalizedValue =
    isEmailField && typeof value === 'string' ? value.toLowerCase() : value;

  return {
    sql: `"${objectNameSingular}"."${key}" @> :${key}${uuid}::jsonb`,
    params: { [`${key}${uuid}`]: JSON.stringify([normalizedValue]) },
  };
}
```

## 📸 Screenshots

### Before
<img width="2710" height="1590" alt="Arc 2025-12-17 21 10 28" src="https://github.com/user-attachments/assets/e1bb24c8-d385-4e64-a308-6dbec925f2a8" />

### After
<img width="2710" height="1590" alt="CleanShot 2025-12-17 at 21 31 16@2x" src="https://github.com/user-attachments/assets/e9bc127d-e4ee-4948-aac8-26cf5eb5cdf5" />

## 🧪 How to Test

1. Start the server with `yarn start`
2. Open GraphQL Playground at `http://localhost:3001/settings/playground/graphql/core`
3. Create a person with additional emails:

```graphql
mutation CreateTestPerson {
  createPerson(data: {
    name: { firstName: "Test", lastName: "User" }
    emails: {
      primaryEmail: "primary@test.com"
      additionalEmails: ["test@example.com", "secondary@test.com"]
    }
  }) {
    id
    emails { primaryEmail additionalEmails }
  }
}
```

4. Filter by additional email (case-insensitive - all of these should work):

```graphql
# Lowercase
query FindPeopleByAdditionalEmail {
  people(filter: {
    emails: {
      additionalEmails: {
        containsJsonb: "test@example.com"
      }
    }
  }) {
    edges {
      node {
        id
        name { firstName lastName }
        emails { primaryEmail additionalEmails }
      }
    }
  }
}

# Mixed case - should also work!
query FindPeopleByAdditionalEmailMixedCase {
  people(filter: {
    emails: {
      additionalEmails: {
        containsJsonb: "Test@Example.Com"
      }
    }
  }) {
    edges {
      node {
        id
        name { firstName lastName }
        emails { primaryEmail additionalEmails }
      }
    }
  }
}
```

## 📋 Checklist

- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my own code
- [x] New and existing unit tests pass locally with my changes
- [ ] I have added tests that prove my fix is effective
- [x] Any dependent changes have been merged and published

## 🔗 References

- [Twenty Backend Commands Documentation](https://docs.twenty.com/developers/backend-development/server-commands)
- PostgreSQL JSONB containment operator: https://www.postgresql.org/docs/current/functions-json.html
- Email normalization: `packages/twenty-server/src/engine/core-modules/record-transformer/utils/transform-emails-value.util.ts`
