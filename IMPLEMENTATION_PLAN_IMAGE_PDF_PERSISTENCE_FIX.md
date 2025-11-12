# Implementation Plan: Fix IMAGE/PDF Field Persistence Failure

## Overview
Fix critical data loss issue where IMAGE and PDF field uploads/links work initially but are lost after page reload due to race condition in persistence logic.

**Status**: 🟢 Ready to implement  
**Priority**: 🔴 CRITICAL - Causes data loss  
**Estimated Effort**: 1-2 hours  

---

## Root Cause Summary

The current implementation makes **two persistence calls** for each user action:
1. Direct call to `persistFieldFromFieldInputContext(newValue)`
2. Indirect call via `onSubmit?.({ newValue })` which also calls `persistFieldFromFieldInputContext`

This creates a race condition where:
- First call updates the Recoil store and sends GraphQL mutation
- Second call sees store already updated, **skips the mutation entirely**
- If first call fails or is interrupted, **no data is persisted to database**
- UI shows data (from store), but database has nothing → reload loses everything

---

## Solution: Adopt Standard Pattern (Option 1)

Follow the pattern used by all other field inputs (Rating, Select, Text, Number, etc.):
- **Remove** all direct `persistFieldFromFieldInputContext()` calls
- **Remove** `usePersistFieldFromFieldInputContext` import
- **Only** call `onSubmit?.({ newValue })` to delegate persistence to context

### Benefits
✅ Single persistence call eliminates race condition  
✅ Follows existing codebase patterns  
✅ Context handlers manage store updates correctly  
✅ Simpler, more maintainable code  

---

## Files to Modify

### 1. `ImageFieldInput.tsx`
**Path**: `packages/twenty-front/src/modules/object-record/record-field/ui/meta-types/input/components/ImageFieldInput.tsx`

**Changes Required**:
- Remove import on line 8
- Refactor `handleFileChange` (lines 88-132)
- Refactor `handleModalClose` (lines 150-167)
- Refactor `handleRemove` (lines 169-184)
- Remove `persistFieldFromFieldInputContext` destructuring on line 53
- Remove `setFieldValue` destructuring on line 51 (no longer needed)

### 2. `PdfFieldInput.tsx`
**Path**: `packages/twenty-front/src/modules/object-record/record-field/ui/meta-types/input/components/PdfFieldInput.tsx`

**Changes Required**:
- Remove import on line 8
- Refactor `handleFileChange` (lines 88-132)
- Refactor `handleModalClose` (lines 150-167)
- Refactor `handleRemove` (lines 169-184)
- Remove `persistFieldFromFieldInputContext` destructuring on line 53
- Remove `setFieldValue` destructuring on line 51 (no longer needed)

---

## Implementation Steps

### Step 1: Update ImageFieldInput.tsx

#### 1.1 Remove Import
**Lines 8, 51, 53**
```typescript
// REMOVE:
import { usePersistFieldFromFieldInputContext } from '@/object-record/record-field/ui/hooks/usePersistFieldFromFieldInputContext';

// CHANGE line 51 FROM:
const { recordId, objectMetadataNameSingular, fieldDefinition, draftValue, setDraftValue, setFieldValue } = useImageField();

// TO:
const { recordId, objectMetadataNameSingular, fieldDefinition, draftValue, setDraftValue } = useImageField();

// REMOVE line 53:
const { persistFieldFromFieldInputContext } = usePersistFieldFromFieldInputContext();
```

#### 1.2 Refactor handleFileChange
**Lines 88-132**
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
    
    // REMOVE these two lines:
    // setDraftValue(newValue);
    // persistFieldFromFieldInputContext(newValue);
    
    // KEEP only this (it handles both draft update and persistence):
    onSubmit?.({ newValue });
  } finally {
    setIsUploading(false);
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  }
};
```

#### 1.3 Refactor handleModalClose
**Lines 150-167**
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
  
  // REMOVE these two lines:
  // persistFieldFromFieldInputContext(newValue);
  // onSubmit?.({ newValue });
  
  // KEEP only:
  onSubmit?.({ newValue });
};
```

#### 1.4 Refactor handleRemove
**Lines 169-184**
```typescript
const handleRemove = (attachmentId: string) => {
  const index = attachmentIds.indexOf(attachmentId);
  if (index === -1) return;

  const newValue = {
    attachmentIds: attachmentIds.filter((_: unknown, i: number) => i !== index),
    fullPaths: (draftValue?.fullPaths || []).filter((_: unknown, i: number) => i !== index),
    names: (draftValue?.names || []).filter((_: unknown, i: number) => i !== index),
    types: (draftValue?.types || []).filter((_: unknown, i: number) => i !== index),
  };

  // REMOVE these three lines:
  // setDraftValue(newValue);
  // persistFieldFromFieldInputContext(newValue);
  // onSubmit?.({ newValue });
  
  // KEEP only:
  onSubmit?.({ newValue });
};
```

### Step 2: Update PdfFieldInput.tsx

Apply **identical changes** as ImageFieldInput.tsx:
- Remove import (line 8)
- Update destructuring (lines 51, 53)
- Refactor `handleFileChange` (lines 88-132)
- Refactor `handleModalClose` (lines 150-167)
- Refactor `handleRemove` (lines 169-184)

---

## Code Changes Summary

### Before (Current - Broken):
```typescript
// Three state updates for each action:
setDraftValue(newValue);                        // Update draft
persistFieldFromFieldInputContext(newValue);    // Try to persist (may skip)
onSubmit?.({ newValue });                       // Try to persist again (skipped)
```

### After (Fixed):
```typescript
// Single persistence call:
onSubmit?.({ newValue });  // Context handles everything correctly
```

---

## Testing Plan

### Test Scenarios (For Both IMAGE and PDF Fields)

#### 1. Upload Functionality
- [ ] Open IMAGE field input in table view (inline cell)
- [ ] Click "Upload Images" button
- [ ] Select 2-3 image files
- [ ] Verify images appear in UI
- [ ] **Open browser DevTools → Network tab**
- [ ] Verify **exactly ONE** GraphQL `updateOneRecord` mutation is sent
- [ ] **Reload the page**
- [ ] Verify images are still present (data persisted)

#### 2. Link Existing Functionality
- [ ] Open IMAGE field input
- [ ] Click "Link Existing" button
- [ ] Select 2-3 existing attachments from modal
- [ ] Click outside modal to close (triggers `handleModalClose`)
- [ ] **Open browser DevTools → Network tab**
- [ ] Verify **exactly ONE** GraphQL `updateOneRecord` mutation is sent
- [ ] **Reload the page**
- [ ] Verify linked images are still present

#### 3. Remove Functionality
- [ ] Open IMAGE field with existing attachments
- [ ] Click remove (X) button on one attachment
- [ ] **Open browser DevTools → Network tab**
- [ ] Verify **exactly ONE** GraphQL `updateOneRecord` mutation is sent
- [ ] **Reload the page**
- [ ] Verify attachment stays removed

#### 4. PDF Field Tests
- [ ] Repeat all above tests with PDF field
- [ ] Upload PDF files
- [ ] Link existing PDF attachments
- [ ] Remove PDF attachments
- [ ] Verify persistence after each reload

#### 5. Context Tests
- [ ] Test in **table view** (RecordInlineCell context)
- [ ] Test in **record detail view** (RecordShowPage context)
- [ ] Test in **creation flow** (RecordCreate context)

#### 6. Edge Cases
- [ ] Upload multiple files at once (5+ files)
- [ ] Test with slow network (Chrome DevTools → Slow 3G)
- [ ] Test immediately after page load (metadata readiness)
- [ ] Test rapid add/remove cycles

---

## Validation Criteria

### ✅ Success Indicators
1. **Network tab shows exactly ONE mutation per user action** (no duplicates)
2. **Data persists after page reload** (no data loss)
3. **No console errors** during upload/link/remove operations
4. **UI updates immediately** after each action
5. **Consistent behavior across all contexts** (table, detail, create)

### ❌ Failure Indicators
1. Multiple mutations sent for single action
2. Data lost after page reload
3. Console errors about missing metadata or undefined values
4. UI shows data but network tab shows no mutation

---

## Rollback Plan

If issues arise after deployment:

1. **Immediate rollback**: Revert commits for both files
2. **Investigate**: Check for contexts where `onSubmit` is not defined
3. **Fallback implementation** (if needed):
   ```typescript
   // Add fallback for contexts without onSubmit
   if (onSubmit) {
     onSubmit({ newValue });
   } else {
     // Direct persistence as fallback
     persistFieldFromFieldInputContext(newValue);
   }
   ```

---

## Optional Enhancements (Post-Fix)

### Enhancement 1: Metadata Readiness Guard
Add safety check in `usePersistFieldFromFieldInputContext.ts`:

```typescript
export const usePersistFieldFromFieldInputContext = () => {
  const { fieldDefinition, recordId } = useContext(FieldContext);
  const { objectMetadataItems } = useObjectMetadataItems();

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItemToFind) =>
      objectMetadataItemToFind.fields.some(
        (fieldMetadataItemToFind) =>
          fieldMetadataItemToFind.id === fieldDefinition.fieldMetadataId,
      ),
  );

  // ADD: Warn if metadata not ready
  if (!objectMetadataItem?.id) {
    console.warn(
      `[usePersistFieldFromFieldInputContext] Metadata not ready for field ${fieldDefinition.fieldMetadataId}`
    );
  }

  const persistField = usePersistField({
    objectMetadataItemId: objectMetadataItem?.id ?? '',
  });

  const persistFieldFromFieldInputContext = (valueToPersist: unknown) => {
    // ADD: Guard against empty metadata ID
    if (!objectMetadataItem?.id) {
      console.error(
        `[usePersistFieldFromFieldInputContext] Cannot persist: metadata not loaded for field ${fieldDefinition.fieldMetadataId}`
      );
      return;
    }
    
    persistField({
      recordId,
      fieldDefinition,
      valueToPersist,
    });
  };

  return { persistFieldFromFieldInputContext };
};
```

### Enhancement 2: Temporary Diagnostic Logging
Add temporary console logs during testing to verify flow:

```typescript
// In ImageFieldInput.tsx handleFileChange (remove after testing)
const newValue = { ... };
console.log('[ImageFieldInput] Calling onSubmit with:', newValue);
onSubmit?.({ newValue });
```

```typescript
// In usePersistField.ts (remove after testing)
if (isDeeplyEqual(valueToPersist, currentValue)) {
  console.log('[usePersistField] Skipping persistence - values equal:', {
    valueToPersist,
    currentValue,
    fieldName,
    recordId,
  });
  return;
}
console.log('[usePersistField] Persisting value:', {
  valueToPersist,
  fieldName,
  recordId,
});
```

---

## Timeline

| Step | Task | Estimated Time | Status |
|------|------|----------------|--------|
| 1 | Update ImageFieldInput.tsx | 20 min | ⏳ Pending |
| 2 | Update PdfFieldInput.tsx | 20 min | ⏳ Pending |
| 3 | Test upload functionality | 15 min | ⏳ Pending |
| 4 | Test link existing functionality | 15 min | ⏳ Pending |
| 5 | Test remove functionality | 10 min | ⏳ Pending |
| 6 | Test both IMAGE and PDF fields | 15 min | ⏳ Pending |
| 7 | Test across contexts (table/detail) | 15 min | ⏳ Pending |
| 8 | Edge case testing (slow network, etc.) | 20 min | ⏳ Pending |
| **Total** | | **~2 hours** | |

---

## References

### Bug Report
- `BUG_REPORT_IMAGE_PDF_PERSISTENCE_FAILURE.md`

### Reference Implementations (Correct Pattern)
- `RatingFieldInput.tsx:16-18` - Only calls `onSubmit`
- `SelectFieldInput.tsx` - Only calls `onSubmit`
- `NumberFieldInput.tsx:54-60` - Only calls `onEnter`/`onSubmit`

### Context Handler (Where Persistence Actually Happens)
- `RecordInlineCell.tsx:190-203` - `handleSubmit` calls `persistFieldFromFieldInputContext`

### Persistence Layer
- `usePersistField.ts:188-224` - Equality check that causes skips
- `usePersistFieldFromFieldInputContext.ts` - Context wrapper for persistence

---

## Sign-off

- [ ] Code changes reviewed
- [ ] All tests passed
- [ ] Network traffic verified (single mutation per action)
- [ ] Data persistence verified (reload test)
- [ ] No console errors
- [ ] Ready to commit

---

## Notes

- **DO NOT** add `setDraftValue` back - `onSubmit` handler manages state internally
- **DO NOT** call `setFieldValue` directly - persistence layer handles this
- **Keep** the `setIsUploading` state (for UI loading indicator)
- **Keep** the `inputFileRef.current.value = ''` reset (allows re-uploading same file)

