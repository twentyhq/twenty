# Infinite Loop Fix: Maximum Update Depth Exceeded

## Issue Resolved ✅

**Error**: `Warning: Maximum update depth exceeded`  
**Location**: `ImageFieldInput.tsx` and `PdfFieldInput.tsx`  
**Status**: **FIXED**

---

## What Was Happening

When you opened an IMAGE or PDF field in the table view, React threw an error:

```
Warning: Maximum update depth exceeded. This can happen when a component 
calls setState inside useEffect, but useEffect either doesn't have a 
dependency array, or one of the dependencies changes on every render.
```

This was caused by an **infinite render loop** in the modal selection logic.

---

## Root Cause

### The REAL Problematic Flow:

The issue was **NOT** just `handleSelectionChange` (that was fixed initially), but a **memoization problem**:

1. Component renders
2. Line 57: `const attachmentIds = draftValue?.attachmentIds || [];`
   - **Creates a NEW empty array `[]` every render** if `draftValue?.attachmentIds` is falsy!
3. `useEffect` has `[attachmentIds]` as dependency
4. **React sees `attachmentIds` as changed** (different array reference)
5. `useEffect` calls `setPendingSelection(attachmentIds)`
6. This triggers a state update → component re-renders
7. Back to step 2 → **infinite loop!**

### The Problematic Code (Before):

```typescript
// Line 57 - NEW array reference every render!
const attachmentIds = draftValue?.attachmentIds || [];  // ❌ NEW [] each time!

// Line 131-133 - useEffect triggers on every render
useEffect(() => {
  setPendingSelection(attachmentIds);  // ← attachmentIds is "new" every time!
}, [attachmentIds]);  // ❌ Dependency always changes
```

---

## The Fix

### What We Changed:

**Memoized `attachmentIds` to prevent new array references:**

```typescript
// OLD (Broken):
const attachmentIds = draftValue?.attachmentIds || [];  // ❌ NEW [] every render

// NEW (Fixed):
const attachmentIds = useMemo(
  () => draftValue?.attachmentIds || [], 
  [draftValue?.attachmentIds]  // ✅ Only changes when actual value changes
);
```

### Why This Works:

- **`useMemo` caches the result**: Returns the same array reference unless `draftValue?.attachmentIds` actually changes
- **Prevents false changes**: `useEffect` only triggers when the **actual data** changes, not on every render
- **Stable dependencies**: The `useEffect` dependency array now has a stable reference
- **No infinite loop**: Component renders normally without triggering the `useEffect` unnecessarily

---

## Files Modified

Both files had the same issue and received the same fix:

1. `packages/twenty-front/src/modules/object-record/record-field/ui/meta-types/input/components/ImageFieldInput.tsx`
   - Line 58: **Memoized `attachmentIds`** using `useMemo` to prevent new array references
   - Line 50: Removed unused `setDraftValue` from destructuring
   - Line 140: Removed `setDraftValue()` from `handleSelectionChange`

2. `packages/twenty-front/src/modules/object-record/record-field/ui/meta-types/input/components/PdfFieldInput.tsx`
   - Line 58: **Memoized `attachmentIds`** using `useMemo` to prevent new array references
   - Line 50: Removed unused `setDraftValue` from destructuring
   - Line 140: Removed `setDraftValue()` from `handleSelectionChange`

---

## Before vs After

### Before (Broken):
- ❌ Infinite render loop when opening field in table view
- ❌ "Maximum update depth exceeded" error in console
- ❌ UI becomes unresponsive
- ❌ Modal selection updates draft value immediately (incomplete data)

### After (Fixed):
- ✅ No infinite loop
- ✅ No React errors
- ✅ Smooth UI interaction
- ✅ Modal selection only updates temporary state
- ✅ Field value only updates when modal closes (complete data)

---

## Testing Status

### ✅ Confirmed Fixed:
- No more "Maximum update depth exceeded" error
- Component renders normally in table view
- Modal opens and closes smoothly
- Selection changes don't trigger re-renders

### 🧪 Still Need to Test:
- Upload functionality (verify data persists after reload)
- Link existing functionality (verify data persists after reload)
- Remove functionality (verify data persists after reload)

---

## Why Modal Selection Shouldn't Update Draft Value

### The Correct Pattern:

1. **During selection** (modal open):
   - User is browsing/selecting
   - Updates should be **temporary** (`pendingSelection` state)
   - No persistence or draft updates

2. **On confirmation** (modal close):
   - User has made final selection
   - Update field value with **complete data** (IDs + paths + names + types)
   - Persist to database via `onSubmit`

3. **On cancel** (modal close without save):
   - Discard temporary selection
   - Revert to original value

### What Was Wrong:

The old code updated draft value **during selection**, which:
- Triggered unnecessary re-renders
- Created incomplete field values (only IDs, missing other fields)
- Caused infinite loop with `useEffect` sync logic

---

## Related Fixes

This is part of a larger fix for IMAGE/PDF field persistence issues:

1. ✅ **Infinite loop fix** (this document)
2. ✅ **Double persistence fix** (removed duplicate calls)
3. ✅ **Metadata readiness guard** (prevent silent failures)

All documented in: `IMPLEMENTATION_SUMMARY_IMAGE_PDF_FIX.md`

---

## Key Takeaway

**Modal selections should only update temporary UI state, not field values.**

Field values should only be updated when the user confirms their action (closes modal, clicks save, etc.) with complete, validated data.

---

✅ **Fix confirmed working!** No more infinite loop errors.

