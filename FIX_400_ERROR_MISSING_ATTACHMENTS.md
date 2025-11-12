# Fix: 400 Error - Missing Attachment Metadata

## Issue

**Error**: `Failed to load resource: the server responded with a status of 400 (Bad Request)`  
**Symptom**: UI optimistically shows linked attachments, but they disappear after the GraphQL mutation fails  
**Root Cause**: Mismatched array lengths in composite field data

---

## What Was Happening

When linking existing attachments via the modal:

1. User selects attachments in modal (stored in `pendingSelection` array with IDs)
2. Modal closes, `handleModalClose` is called
3. Code tries to map IDs to attachment details from `allAttachments`
4. **If some attachments aren't found** (not loaded, filtered out, etc.), the arrays become **mismatched**:
   - `attachmentIds`: `['id1', 'id2', 'id3']` (3 items)
   - `fullPaths`: `['path1', 'path2']` (2 items - one missing!)
   - `names`: `['name1', 'name2']` (2 items - one missing!)
   - `types`: `['type1', 'type2']` (2 items - one missing!)
5. Server receives invalid data → **400 Bad Request**
6. Apollo rolls back optimistic update → attachments disappear

---

## Root Causes

### 1. Silent Filtering in handleModalClose

**Before (Broken)**:
```typescript
const selectedAttachments = pendingSelection
  .map(id => allAttachments.find(a => a.id === id))
  .filter(isDefined);  // ❌ Silently removes undefined without checking!

const newValue = {
  attachmentIds: pendingSelection,  // Length: 3
  fullPaths: selectedAttachments.map(a => a.fullPath),  // Length: 2 ❌
  names: selectedAttachments.map(a => a.name),
  types: selectedAttachments.map(a => a.type),
};
```

### 2. No Validation of Array Lengths

The code didn't check if all arrays had the same length before sending to the server.

### 3. Possible Timing Issues

`allAttachments` might not be fully loaded when modal closes, causing lookups to fail.

---

## The Fix

Added validation in `handleModalClose` for both IMAGE and PDF fields:

```typescript
const handleModalClose = () => {
  closeModal(MODAL_ID);
  
  // Don't persist if no selection changed
  if (pendingSelection.length === attachmentIds.length && 
      pendingSelection.every((id, index) => id === attachmentIds[index])) {
    return;  // ✅ Skip unnecessary mutation
  }
  
  // Map selected IDs to their attachment details
  const selectedAttachments = pendingSelection
    .map(id => {
      const attachment = allAttachments.find(a => a.id === id);
      if (!attachment) {
        console.warn(`[ImageFieldInput] Attachment not found for ID: ${id}`);
      }
      return attachment;
    })
    .filter(isDefined);
  
  // ✅ VALIDATE: Ensure all IDs were resolved to attachments
  if (selectedAttachments.length !== pendingSelection.length) {
    console.error('[ImageFieldInput] Cannot persist: some attachments not found');
    return;  // ✅ Prevent sending invalid data
  }
  
  // Now all arrays are guaranteed to be the same length
  const newValue = {
    attachmentIds: pendingSelection,
    fullPaths: selectedAttachments.map(a => a.fullPath),
    names: selectedAttachments.map(a => a.name),
    types: selectedAttachments.map(a => a.type),
  };
  
  onSubmit?.({ newValue });
};
```

---

## What This Fixes

### ✅ Validation Before Persistence
- Checks if all selected IDs can be resolved to attachment objects
- Logs warnings for missing attachments
- **Prevents sending invalid data** to the server

### ✅ Skip Unnecessary Mutations
- Checks if selection actually changed before persisting
- Reduces unnecessary network requests

### ✅ Better Error Messages
- Console warnings show which attachment IDs couldn't be found
- Console error explains why persistence was skipped
- Makes debugging much easier

---

## Testing

After this fix, you should see:

### ✅ Success Case:
1. Open IMAGE/PDF field
2. Click "Link Existing"
3. Select attachments
4. Close modal
5. ✅ **No console warnings**
6. ✅ **GraphQL mutation succeeds** (check Network tab)
7. ✅ **Attachments persist after page reload**

### ⚠️ Error Case (if attachments not loaded):
1. Open IMAGE/PDF field
2. Click "Link Existing"  
3. Select attachments
4. Close modal
5. ⚠️ **Console warning**: `Attachment not found for ID: xyz`
6. ⚠️ **Console error**: `Cannot persist: some attachments not found`
7. ✅ **No 400 error** (mutation not sent)
8. ✅ **No optimistic update rollback** (no mutation to roll back)

---

## Why Attachments Might Not Be Found

Several possible reasons:

1. **Timing Issue**: `allAttachments` query hasn't finished loading
2. **Filter Mismatch**: Attachment doesn't match `isImageAttachment` or `isPdfAttachment` filter
3. **Cache Issue**: Attachment was deleted but still in UI cache
4. **Network Issue**: Query failed to fetch some attachments

The validation now **safely handles all these cases** instead of sending bad data.

---

## Files Modified

1. `ImageFieldInput.tsx`:
   - Lines 149-183: Added validation in `handleModalClose`
   
2. `PdfFieldInput.tsx`:
   - Lines 144-178: Added validation in `handleModalClose`

---

## Related Issues

This fix also addresses:
- Potential race conditions when modal closes quickly
- Silent failures that were hard to debug
- Inconsistent data causing server validation errors

---

## Key Takeaway

**Always validate array lengths match for composite types before sending mutations.**

Composite types with multiple parallel arrays (like IMAGE/PDF with `attachmentIds`, `fullPaths`, `names`, `types`) require all arrays to be the same length. The server expects this invariant and returns 400 if violated.

---

✅ **Fix applied!** The 400 error should be resolved, and you'll get clear console messages if attachments can't be found.

