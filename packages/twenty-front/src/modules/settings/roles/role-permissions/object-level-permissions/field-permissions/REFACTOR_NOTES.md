# Field Permissions Table Alignment - Refactor Notes

## Current State

The field permissions table has three different row types with inconsistent padding structures:

1. **Header row** - Uses `TableHeader` components with `padding: 0 theme.spacing(2)`
2. **"All" row** - Uses `StyledSectionHeader` grid with only `padding-left: theme.spacing(2)`
3. **Data rows** - Uses `TableCell` components with `padding: 0 theme.spacing(2)`

## Current Fix

The "All" row checkboxes use `StyledCheckboxContainer` with `padding-right: theme.spacing(3)` to manually align with the data rows below. This is a pragmatic workaround but introduces a magic number.

## Proper Refactor (Future Work)

### Changes Required:

#### 1. **Restructure the "All" row to use TableCell components**
   - Instead of `StyledSectionHeader` being a single grid container, it would need to become a `TableRow` (or styled variant)
   - Each column ("All" label, empty spacer, See checkbox, Edit checkbox) would need to be wrapped in `TableCell` components
   - This ensures consistent padding across all row types

#### 2. **Update the "All" row styling**
   - The background color and border would move from `StyledSectionHeader` to the `TableRow` wrapper
   - Remove the manual `padding-left` since `TableCell` handles padding
   - Remove `grid-template-columns` since the row would inherit it from the styled component

#### 3. **Handle the first column specially**
   - The "All" label would need to be in a `TableCell` (or `StyledNameTableCell` to match data rows)
   - This might need special styling since data rows have icons + labels with gap, while "All" is just text

#### 4. **Remove StyledCheckboxContainer workaround**
   - The `padding-right: spacing(3)` would be removed
   - Checkboxes would align naturally since they're in `TableCell` with standard padding

### Complexity:
- **Code changes**: ~30-40 lines modified in `SettingsRolePermissionsObjectLevelObjectFieldPermissionTableAllHeaderRow.tsx`
- **Risk**: Medium - the "All" row has complex conditional rendering logic that needs to stay intact
- **Testing needed**: Visual regression testing to ensure alignment across all states (with/without See column, with/without Edit column)
- **Time estimate**: 30-45 minutes including testing

### Why it's "moderate":
- It's contained to one component file
- But the "All" row has conditional column rendering that needs careful handling
- Need to ensure the background color styling still works correctly
- Need to verify alignment in all permission states (different combinations of visible columns)

## Recommendation

The current fix (`padding-right: spacing(3)`) is acceptable for now as:
- It's low-risk and localized
- The "All" row has unique visual treatment anyway
- The proper refactor can be done when there's time for thorough testing
