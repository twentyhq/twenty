# Bug Report: IMAGE/PDF Field Persistence Failure After Page Reload

## Status
🔴 **CRITICAL**: Direct upload and link existing functionality work initially, but data is lost after page reload.

## Observed Behavior
1. ✅ User uploads files → Files appear immediately in UI
2. ✅ User links existing attachments → Attachments appear immediately in UI
3. ❌ User reloads page → All attachments are GONE
4. ❌ Data is not persisted to database

## Expected Behavior
After upload/link and page reload, the attachment IDs (and related metadata) should persist and reload from the database.

---

## Root Cause Analysis

### Issue 1: Race Condition in State Update Order ⚠️

**Location**: `ImageFieldInput.tsx:120-124` and `PdfFieldInput.tsx:120-124`

**Current Code**:
```typescript
setDraftValue(newValue);  // ← Updates draft state
persistFieldFromFieldInputContext(newValue);  // ← Should persist to DB
onSubmit?.({ newValue });  // ← Optional callback
```

**Problem**: 
The order of operations creates a race condition in `usePersistField`:

1. `setDraftValue(newValue)` updates component draft state
2. `persistFieldFromFieldInputContext(newValue)` is called
3. Inside `usePersistField`, it compares `valueToPersist` with `currentValue` from the store:
   ```typescript
   const currentValue = snapshot
     .getLoadable(recordStoreFamilySelector({ recordId, fieldName }))
     .getValue();
   
   if (isDeeplyEqual(valueToPersist, currentValue)) {
     return; // ← SKIP PERSISTENCE!
   }
   ```

4. **If the store value is somehow already equal to `newValue` (possibly from a previous render or state sync), the persistence is SKIPPED entirely**

### Issue 2: Dual Persistence Calls 🔁

**Location**: `RecordInlineCell.tsx:98-104`

**Context Code**:
```typescript
const handleSubmit: FieldInputEvent = ({ newValue, skipPersist }) => {
  if (skipPersist !== true) {
    persistFieldFromFieldInputContext(newValue);  // ← ALSO persists!
  }
  closeInlineCell();
};
```

**Problem**:
In `ImageFieldInput` and `PdfFieldInput`, we call:
1. Direct: `persistFieldFromFieldInputContext(newValue)` (line 122)
2. Through callback: `onSubmit?.({ newValue })` (line 124)

This results in **TWO persistence attempts**:
- First call: Compares store value, updates it, calls GraphQL mutation
- Second call (through `onSubmit`): Sees store already updated, **SKIPS** mutation

**Result**: The second call short-circuits, but if the first call fails for any reason, nothing is persisted.

### Issue 3: Incorrect State Update Synchronization 🔄

**Current Flow**:
```
Upload Complete
    ↓
setDraftValue(newValue)  // Updates component state
    ↓
persistFieldFromFieldInputContext(newValue)  // Checks store, may skip if already equal
    ↓
onSubmit?.(newValue)  // Calls persist AGAIN (skipped due to store match)
```

**Expected Flow** (from other field inputs like `RatingFieldInput.tsx:16-18`):
```typescript
const handleChange = (newRating: FieldRatingValue) => {
  onSubmit?.({ newValue: newRating });  // ONLY call onSubmit
};
```

Other field inputs **only call `onSubmit`**, not both `persistFieldFromFieldInputContext` AND `onSubmit`.

---

## Deep Dive: Persistence Logic in `usePersistField.ts`

**Critical Section** (lines 188-224):
```typescript
const currentValue: any = snapshot
  .getLoadable(recordStoreFamilySelector({ recordId, fieldName }))
  .getValue();

if (isDeeplyEqual(valueToPersist, currentValue)) {
  return;  // ← NO MUTATION IS SENT IF VALUES ARE EQUAL!
}

set(
  recordStoreFamilySelector({ recordId, fieldName }),
  valueToPersist,
);

updateOneRecord?.({  // ← THIS IS THE ACTUAL DB WRITE
  idToUpdate: recordId,
  updateOneRecordInput: {
    [fieldName]: valueToPersist,
  },
});
```

**The Check That Fails**:
If `currentValue` in the Recoil store already equals `valueToPersist`, the function returns early and **never calls `updateOneRecord`**, meaning **no GraphQL mutation is sent**.

---

## Why It Appears to Work Initially

1. **UI Updates**: `setDraftValue` updates component state, so UI shows the new attachments
2. **Store Updates**: `persistFieldFromFieldInputContext` updates the Recoil store (line 203-206 in `usePersistField.ts`)
3. **BUT**: The GraphQL mutation may be skipped if the store value already matches
4. **Result**: UI looks correct, store has data, but **database has no data**
5. **On Reload**: Fresh fetch from database returns empty value, proving nothing was saved

---

## Problematic State Synchronization

### State Layers in Play:
1. **Component Draft State**: `recordFieldInputDraftValueComponentState` (updated by `setDraftValue`)
2. **Recoil Record Store**: `recordStoreFamilySelector` (updated by `persistField`)
3. **Database**: Updated by `updateOneRecord` GraphQL mutation

### The Race:
```
setDraftValue(newValue)
    ↓ (Draft state updated)
persistFieldFromFieldInputContext(newValue)
    ↓
    Reads from recordStoreFamilySelector
    ↓
    IF (store already has newValue)  ← KEY CHECK
        SKIP mutation ❌
    ELSE
        Update store
        Call updateOneRecord ✅
```

**Question**: How does the store get `newValue` before persistence?
**Answer**: Multiple possible sources:
- Previous render cycle
- `setFieldValue` called elsewhere (e.g., from field hooks)
- Store sync from draft value
- Re-render between `setDraftValue` and `persistFieldFromFieldInputContext`

---

## Evidence: Other Field Inputs DO NOT Call Both

### RatingFieldInput.tsx:
```typescript
const handleChange = (newRating: FieldRatingValue) => {
  onSubmit?.({ newValue: newRating });  // ONLY onSubmit
};
```

### SelectFieldInput.tsx:
```typescript
const handleSubmit = (option: SelectOption) => {
  onSubmit?.({ newValue: option.value });  // ONLY onSubmit
  resetSelectedItem();
};
```

### TextFieldInput.tsx:
```typescript
const handleEnter = (newText: string) => {
  onEnter?.({ newValue: newText.trim() });  // Relies on context handler
};
```

**Pattern**: Field inputs delegate persistence to the context handlers (`onSubmit`, `onEnter`, etc.), which internally call `persistFieldFromFieldInputContext`.

**Our Code**: Calls `persistFieldFromFieldInputContext` directly AND `onSubmit`, causing double-persistence attempts and race conditions.

---

## Why `handleModalClose` (Link Existing) Also Fails

**Location**: `ImageFieldInput.tsx:156-168` / `PdfFieldInput.tsx:156-168`

**Current Code**:
```typescript
const handleModalClose = () => {
  closeModal(MODAL_ID);
  
  const selectedAttachments = pendingSelection
    .map(id => allAttachments.find(a => a.id === id))
    .filter(isDefined);
  
  const newValue = {
    attachmentIds: pendingSelection,
    fullPaths: selectedAttachments.map(a => a.fullPath),
    names: selectedAttachments.map(a => a.name),
    types: selectedAttachments.map(a => a.type),
  };
  
  persistFieldFromFieldInputContext(newValue);  // ← Direct call
  onSubmit?.({ newValue });  // ← Also calls persist
};
```

**Same Issue**: Double persistence + store already contains `newValue` from previous operations = mutation skipped.

---

## Recommended Fix

### Option 1: Follow Standard Pattern (Recommended) ✅

**Remove direct `persistFieldFromFieldInputContext` calls** and **only use context callbacks**:

```typescript
// In handleFileChange (upload)
const newValue = { ... };
setDraftValue(newValue);
onSubmit?.({ newValue });  // Let context handle persistence

// In handleModalClose (link existing)
const newValue = { ... };
setDraftValue(newValue);
onSubmit?.({ newValue });  // Let context handle persistence

// In handleRemove
const newValue = { ... };
setDraftValue(newValue);
onSubmit?.({ newValue });  // Let context handle persistence
```

**Pros**:
- Follows existing codebase patterns
- Single persistence call eliminates race condition
- Context handlers manage store updates correctly

**Cons**:
- Relies on `onSubmit` being defined (may not be in all contexts)

### Option 2: Ensure Store is Clean Before Persistence

**Call persistence BEFORE setting draft value**:

```typescript
// Current (broken):
setDraftValue(newValue);
persistFieldFromFieldInputContext(newValue);

// Fixed:
persistFieldFromFieldInputContext(newValue);  // Store sees old value, persists correctly
setDraftValue(newValue);  // Update draft after persistence
```

**Pros**:
- Ensures store comparison sees the old value
- Direct control over persistence

**Cons**:
- Still makes two persistence calls (direct + onSubmit)
- Unusual pattern compared to other field inputs

### Option 3: Skip Duplicate Persistence in Context

**Pass `skipPersist: true` to `onSubmit`**:

```typescript
persistFieldFromFieldInputContext(newValue);
onSubmit?.({ newValue, skipPersist: true });  // Skip second persistence
```

**Pros**:
- Keeps both calls but prevents duplicate persistence
- Direct control over when to persist

**Cons**:
- Still unusual pattern
- More complex than Option 1

---

## Recommended Implementation (Option 1)

### Changes Needed:

**1. Remove direct `persistFieldFromFieldInputContext` calls**
**2. Remove `usePersistFieldFromFieldInputContext` import (no longer needed)**
**3. Only call `onSubmit` with newValue**

### Example for `handleFileChange`:

```typescript
const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
  if (!isDefined(e.target.files) || e.target.files.length === 0) {
    return;
  }

  setIsUploading(true);

  try {
    const uploadedData: {
      ids: string[];
      paths: string[];
      names: string[];
      types: string[];
    } = { ids: [], paths: [], names: [], types: [] };

    for (const file of Array.from(e.target.files)) {
      const result = await uploadAttachmentFile(file, targetableObject);
      if (result?.attachment) {
        uploadedData.ids.push(result.attachment.id);
        uploadedData.paths.push(result.attachment.fullPath);
        uploadedData.names.push(result.attachment.name);
        uploadedData.types.push(result.attachment.type);
      }
    }

    const newValue = {
      attachmentIds: [...attachmentIds, ...uploadedData.ids],
      fullPaths: [...(draftValue?.fullPaths || []), ...uploadedData.paths],
      names: [...(draftValue?.names || []), ...uploadedData.names],
      types: [...(draftValue?.types || []), ...uploadedData.types],
    };
    
    // ONLY call onSubmit, not persistFieldFromFieldInputContext
    onSubmit?.({ newValue });
  } finally {
    setIsUploading(false);
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  }
};
```

**Note**: If `onSubmit` is not defined in certain contexts, we need a fallback:

```typescript
// Fallback if onSubmit is not available
if (onSubmit) {
  onSubmit({ newValue });
} else {
  // Direct persistence as fallback (e.g., in modal/standalone contexts)
  persistFieldFromFieldInputContext(newValue);
  setFieldValue(newValue);
}
```

---

## Testing Checklist

After implementing the fix:

- [ ] Upload image → Check network tab for GraphQL mutation
- [ ] Upload image → Reload page → Images still there
- [ ] Link existing image → Check network tab for GraphQL mutation
- [ ] Link existing image → Reload page → Images still there
- [ ] Remove image → Check network tab for GraphQL mutation
- [ ] Remove image → Reload page → Image stays removed
- [ ] Upload PDF → Verify persistence
- [ ] Link PDF → Verify persistence
- [ ] Test in table view (RecordInlineCell context)
- [ ] Test in record detail view
- [ ] Test in modal/standalone contexts

---

## Related Files

- `packages/twenty-front/src/modules/object-record/record-field/ui/meta-types/input/components/ImageFieldInput.tsx`
- `packages/twenty-front/src/modules/object-record/record-field/ui/meta-types/input/components/PdfFieldInput.tsx`
- `packages/twenty-front/src/modules/object-record/record-field/ui/hooks/usePersistField.ts`
- `packages/twenty-front/src/modules/object-record/record-field/ui/hooks/usePersistFieldFromFieldInputContext.ts`
- `packages/twenty-front/src/modules/object-record/record-inline-cell/components/RecordInlineCell.tsx`

---

## Additional Notes

### Why `setDraftValue` Doesn't Affect Store Directly

From `useRecordFieldInput.ts`:
```typescript
const setDraftValue = useRecoilCallback(
  ({ set }) =>
    (newValue: unknown) => {
      set(recordFieldInputDraftValueCallbackState, newValue);  // ← Different atom!
    },
  [recordFieldInputDraftValueCallbackState],
);
```

`setDraftValue` updates `recordFieldInputDraftValueCallbackState` (draft state), NOT `recordStoreFamilySelector` (persistent store). They are separate Recoil atoms.

### Store Update Happens Inside `persistField`

From `usePersistField.ts:203-206`:
```typescript
set(
  recordStoreFamilySelector({ recordId, fieldName }),
  valueToPersist,
);
```

This is the ONLY place the record store should be updated during field editing. If it's being updated elsewhere, that's the source of our race condition.

---

## Priority
🔴 **HIGH** - Blocking feature functionality, causes data loss

## Next Steps
1. Implement Option 1 (recommended)
2. Remove duplicate persistence calls
3. Add fallback for contexts without `onSubmit`
4. Test all scenarios in checklist
5. Verify network tab shows GraphQL mutations
6. Verify data persists across page reloads

---

## Verification and Assumption Checks (Double‑Checked)

This section verifies the assumptions in the analysis with direct code references and highlights additional risks that can lead to “no persistence” without throwing errors.

### A. `onSubmit` actually persists via context (Verified)
The inline cell context wires `onSubmit` to persistence:

```190:203:packages/twenty-front/src/modules/object-record/record-inline-cell/components/RecordInlineCell.tsx
  const handleSubmit: FieldInputEvent = ({ newValue, skipPersist }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    closeInlineCell();
  };
```

Implication: Calling `onSubmit({ newValue })` alone is sufficient to persist. Double‑calling persistence is unnecessary and risky.

### B. `setDraftValue` does NOT update the persisted record store (Verified)
It only updates the draft atom family, not the record store selector:

```10:15:packages/twenty-front/src/modules/object-record/record-field/ui/hooks/useRecordFieldInput.ts
  const setDraftValue = useRecoilCallback(
    ({ set }) =>
      (newValue: unknown) => {
        set(recordFieldInputDraftValueCallbackState, newValue);
      },
```

Implication: Using `setDraftValue(newValue)` before persistence won’t trigger the early‐return equality check unless something else has already synced the store.

### C. Persist path sets store and calls GraphQL (Verified)

```188:224:packages/twenty-front/src/modules/object-record/record-field/ui/hooks/usePersistField.ts
  const currentValue: any = snapshot
    .getLoadable(recordStoreFamilySelector({ recordId, fieldName }))
    .getValue();

  if (isDeeplyEqual(valueToPersist, currentValue)) {
    return;
  }

  set(recordStoreFamilySelector({ recordId, fieldName }), valueToPersist);

  updateOneRecord?.({
    idToUpdate: recordId,
    updateOneRecordInput: { [fieldName]: valueToPersist },
  });
```

Implication: If the store already matches `valueToPersist`, the mutation is skipped. Double‑persistence can cause the second call to skip, but the first should still persist if correctly configured.

### D. Composite values are allowed through input sanitizer (Verified)

```14:24:packages/twenty-front/src/modules/object-record/utils/sanitizeRecordInput.ts
  const filteredResultRecord = Object.fromEntries(
    Object.entries(recordInput)
      .map<[string, unknown] | undefined>(([fieldName, fieldValue]) => {
        // ...
        const fieldMetadataItem = objectMetadataItem.fields.find(
          (field) => field.name === fieldName,
        );
        // ...
        return [fieldName, fieldValue];
      })
      .filter(isDefined),
  );
```

Implication: The composite JSON value for IMAGE/PDF is not stripped by sanitization.

### E. Read path includes composite field (Verified)

```8:21:packages/twenty-front/src/modules/object-record/graphql/utils/generateDepthOneRecordGqlFields.ts
export const generateDepthOneRecordGqlFields = ({ objectMetadataItem }) =>
  objectMetadataItem.readableFields.reduce<Record<string, true>>((acc, field) => {
    return {
      ...acc,
      ...(isDefined(field.settings?.joinColumnName) ? { [field.settings.joinColumnName]: true } : {}),
      [field.name]: true,
    };
  }, {});
```

Implication: After a successful write, subsequent reads should include the composite field value.

---

## Additional Risk Identified: Metadata Readiness Can Nullify Persistence (Important)

The persistence layer depends on object metadata resolution. If metadata isn’t ready when persistence is invoked, the mutation can be skipped silently.

Relevant flow:

- `usePersistFieldFromFieldInputContext` finds the object metadata by field id.
- `usePersistField` resolves the `objectMetadataItem` by id and constructs `updateOneRecord` with `objectNameSingular`.
- If the metadata hasn’t loaded yet, `objectNameSingular` can be `''`, and the `updateOneRecord` machinery will be misconfigured or inert.

Mitigation options:

- Defer persistence until `objectMetadataItem` is available (e.g., guard in `usePersistFieldFromFieldInputContext`).
- Log or throw if `objectMetadataItemId` is empty to fail fast rather than silently skipping.

This risk explains “no errors, but nothing persisted” scenarios when actions occur immediately after mount/load.

---

## Refined Recommendation (Final)

1) Adopt the standard pattern used across inputs:
   - Remove direct `persistFieldFromFieldInputContext` calls in IMAGE/PDF inputs
   - Only call `onSubmit({ newValue })`

2) Prevent silent skips due to metadata not ready:
   - Add a guard in `usePersistFieldFromFieldInputContext` to ensure `objectMetadataItemId` is set; if not, warn and retry or queue persistence once metadata loads.

3) Hardening (optional but helpful):
   - Add temporary console diagnostics in `usePersistField` for equality skip and missing `updateOneRecord` cases during testing.

---

## Developer Test Plan (Expanded)

- Verify a GraphQL mutation is sent exactly once per user action (Upload, Link, Remove)
- Throttle network (Slow 3G) and test immediately after component mount to surface metadata‑readiness issues
- Reload page between each action to confirm persistence
- Test both inline cell context and record detail context
- Validate IMAGE and PDF independently

