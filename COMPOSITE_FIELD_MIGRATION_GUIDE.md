# Composite Field Migration Guide

## Overview

This document describes the fix for missing database columns in composite field types (IMAGE, PDF) and provides instructions for running the migration command.

## Background

### The Problem

Composite field types in Twenty (such as IMAGE and PDF) consist of multiple sub-properties that are stored as separate database columns. For example, an IMAGE field has:
- `attachmentIds` - Array of attachment UUIDs
- `fullPaths` - Array of full file paths
- `names` - Array of file names  
- `types` - Array of MIME types

**Issue**: When IMAGE/PDF fields were created in workspaces, only the `attachmentIds` column was being created in the database. The additional columns (`fullPaths`, `names`, `types`) were defined in the metadata but never actually added to the workspace schema tables.

**Symptoms**:
- ✗ `400 Bad Request` errors when trying to persist IMAGE/PDF field data
- ✗ Database errors: `column "fieldNameFullPaths" does not exist`
- ✗ Unable to create new records with composite fields
- ✗ Data loss when trying to update composite fields
- ✗ UI showing optimistic updates that disappear on page reload

### Root Cause

The workspace metadata sync process (`workspace:sync-metadata`) successfully recorded the need for these columns in the metadata tables, but the actual database migrations (ALTER TABLE statements) to add the composite columns were not being executed on the workspace database schema.

## The Solution

### Migration Command Created

A new NestJS command was created to retroactively add missing composite field columns:

**Command Name**: `workspace:fix-composite-field-columns`

**Location**: `packages/twenty-server/src/engine/workspace-manager/workspace-sync-metadata/commands/fix-composite-field-columns.command.ts`

**Module**: Registered in `workspace-sync-metadata-commands.module.ts`

### What The Command Does

1. **Discovers Workspaces**: Scans all active or suspended workspaces
2. **Identifies Composite Fields**: Finds all composite field types (IMAGE, PDF, etc.) in each workspace
3. **Checks Column Existence**: For each composite field property, queries `information_schema.columns` to check if the database column exists
4. **Creates Missing Columns**: Executes `ALTER TABLE ... ADD COLUMN` statements for any missing columns
5. **Reports Results**: Logs the number of columns added per workspace

### Technical Implementation

```typescript
// Command structure
@Command({
  name: 'workspace:fix-composite-field-columns',
  description: 'Add missing columns for composite fields (IMAGE, PDF, etc.)'
})
export class FixCompositeFieldColumnsCommand 
  extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  
  // Iterates through workspaces and composite fields
  // Uses QueryRunner for safe database operations
  // Applies proper data types and nullable constraints
}
```

**Key Features**:
- ✅ Idempotent - safe to run multiple times
- ✅ Uses proper column naming via `computeCompositeColumnName()`
- ✅ Maps field metadata types to PostgreSQL types correctly
- ✅ Handles nullable/required constraints properly
- ✅ Works with QueryRunner for proper transaction management
- ✅ Provides detailed logging of operations

## How To Use

### Run For All Workspaces

```bash
npx nx run twenty-server:command workspace:fix-composite-field-columns
```

### Run For Specific Workspace

```bash
npx nx run twenty-server:command workspace:fix-composite-field-columns -w <workspace-id>
```

### Command Options

```bash
# Limit to specific workspace
-w, --workspace-id <workspace_id>

# Start from a specific workspace (in ascending order)
--start-from-workspace-id <workspace_id>

# Limit number of workspaces to process
--workspace-count-limit <count>
```

### Example Output

```
[FixCompositeFieldColumnsCommand] Running composite field column fix for workspace: 3b8e6458-5fc1-4e63-8563-008ccddaa6db (1 out of 2)
[FixCompositeFieldColumnsCommand] Added column sfdagFullPaths (jsonb) to workspace_3ixj3i1a5avy16ptijtb3lae3._deal
[FixCompositeFieldColumnsCommand] Added column sfdagNames (jsonb) to workspace_3ixj3i1a5avy16ptijtb3lae3._deal
[FixCompositeFieldColumnsCommand] Added column sfdagTypes (jsonb) to workspace_3ixj3i1a5avy16ptijtb3lae3._deal
[FixCompositeFieldColumnsCommand] Added 9 missing composite field columns for workspace 3b8e6458-5fc1-4e63-8563-008ccddaa6db
```

## Verification

After running the command, verify the fix:

### 1. Check Database Schema

```sql
-- Replace with your workspace schema name
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'workspace_<hash>' 
  AND table_name = '_deal'  -- or your object table
  AND column_name LIKE '%FullPaths%' 
     OR column_name LIKE '%Names%'
     OR column_name LIKE '%Types%';
```

Expected result: All composite field columns should exist.

### 2. Test In UI

1. Create a new record with an IMAGE or PDF field
2. Add an attachment via upload or selector
3. Save the record
4. Reload the page
5. ✅ The attachment should still be visible

### 3. Test Via GraphQL

```graphql
mutation UpdateDeal($id: UUID!, $input: DealUpdateInput!) {
  updateDeal(id: $id, data: $input) {
    id
    myImageField {
      attachmentIds
      fullPaths
      names
      types
    }
  }
}
```

Variables:
```json
{
  "id": "...",
  "input": {
    "myImageField": {
      "attachmentIds": ["uuid-1"],
      "fullPaths": ["/path/to/file.jpg"],
      "names": ["file.jpg"],
      "types": ["image/jpeg"]
    }
  }
}
```

Expected: No errors, data persists.

## Frontend Changes

### Image/PDF Field Input Components

The frontend components were also fixed to properly send all composite data:

**Files Modified**:
- `packages/twenty-front/src/modules/object-record/record-field/ui/meta-types/input/components/ImageFieldInput.tsx`
- `packages/twenty-front/src/modules/object-record/record-field/ui/meta-types/input/components/PdfFieldInput.tsx`

**Changes**:
1. ✅ Removed duplicate persistence calls
2. ✅ Fixed infinite render loop by memoizing `attachmentIds`
3. ✅ Ensured all arrays (`attachmentIds`, `fullPaths`, `names`, `types`) are sent together
4. ✅ Added validation to prevent sending malformed data

### Key Code Pattern

```typescript
// Correct pattern - all arrays sent together
const newValue = {
  attachmentIds: selectedIds,
  fullPaths: selectedAttachments.map(a => a.fullPath),
  names: selectedAttachments.map(a => a.name),
  types: selectedAttachments.map(a => a.type),
};

onSubmit?.({ newValue });
```

## Related Files

### Backend

- `packages/twenty-server/src/engine/workspace-manager/workspace-sync-metadata/commands/fix-composite-field-columns.command.ts` - Migration command
- `packages/twenty-server/src/engine/workspace-manager/workspace-sync-metadata/commands/workspace-sync-metadata-commands.module.ts` - Command registration
- `packages/twenty-server/src/engine/metadata-modules/field-metadata/composite-types/image.composite-type.ts` - IMAGE type definition
- `packages/twenty-server/src/engine/metadata-modules/field-metadata/composite-types/pdf.composite-type.ts` - PDF type definition
- `packages/twenty-server/src/engine/metadata-modules/flat-agent/utils/transform-standard-agent-definition-to-flat-agent.util.ts` - AgentEntity fix

### Frontend

- `packages/twenty-front/src/modules/object-record/record-field/ui/meta-types/input/components/ImageFieldInput.tsx`
- `packages/twenty-front/src/modules/object-record/record-field/ui/meta-types/input/components/PdfFieldInput.tsx`
- `packages/twenty-front/src/modules/object-record/record-field/ui/hooks/usePersistField.ts`
- `packages/twenty-front/src/modules/object-record/record-field/ui/types/guards/isFieldImageValue.ts`
- `packages/twenty-front/src/modules/object-record/record-field/ui/types/guards/isFieldPdfValue.ts`

## Troubleshooting

### Command Reports 0 Columns Added

**Possible Causes**:
1. Columns already exist (command is idempotent)
2. No IMAGE/PDF fields in the workspace
3. All fields are inactive

**Resolution**: Check the workspace's field metadata.

### Permission Errors

**Error**: `Method not allowed because permissions are not implemented at datasource level`

**Resolution**: This was fixed by using `QueryRunner` instead of direct `dataSource.query()`. Ensure you're using the latest version of the command.

### Columns Still Missing After Running Command

**Steps**:
1. Check command output for errors
2. Verify workspace ID is correct
3. Run with `-w` flag for specific workspace
4. Check PostgreSQL logs for DDL errors
5. Manually verify with SQL query

## Future Improvements

### Pending Tasks

1. **Server-side validation** - Validate that all arrays have equal lengths before persisting
2. **Backward compatibility** - Accept only `attachmentIds` and hydrate other arrays server-side
3. **Better error messages** - Return 422 with detailed validation messages instead of 400
4. **Integration tests** - Add comprehensive tests for composite field operations
5. **Frontend documentation** - Document the contract for composite field data structure

### Prevention

To prevent this issue in the future:

1. ✅ Ensure `workspace:sync-metadata` applies all migrations
2. ✅ Add integration tests for composite field column creation
3. ✅ Add health checks to verify composite field schema consistency
4. ✅ Document the full lifecycle of composite field creation

## Summary

This migration command solves a critical issue where IMAGE and PDF fields were not fully functional due to missing database columns. After running the command:

- ✅ All composite field properties have corresponding database columns
- ✅ IMAGE/PDF fields can be created and updated successfully
- ✅ Data persists correctly across page reloads
- ✅ No more 400 errors or column not found errors
- ✅ Frontend and backend are aligned on data structure

## Getting Help

If you encounter issues:

1. Check the command output logs
2. Review the database schema with SQL queries
3. Test with GraphQL mutations
4. Check server logs for detailed error messages
5. Open an issue with reproduction steps

## Change Log

**2025-10-06**:
- Created `workspace:fix-composite-field-columns` command
- Fixed `AgentEntity` property error in metadata sync
- Updated frontend IMAGE/PDF input components
- Added comprehensive documentation

---

**Command Summary**:
```bash
# Quick start - run for all workspaces
npx nx run twenty-server:command workspace:fix-composite-field-columns

# Run for specific workspace
npx nx run twenty-server:command workspace:fix-composite-field-columns -w <workspace-id>
```

