# Patch Management

Operations for creating, modifying, reordering, and organizing StGit patches.

## Creating a New Patch

```bash
git checkout <stgit-branch>

# Create patch at the top of the stack
stg new <patch-name> -m "Short description of the change"

# Make changes to files
# ...

# Record all changes into the patch
stg refresh
```

To create a patch at a specific position in the stack:

```bash
stg pop -a                           # Pop all patches
stg push <patches-before-new-one>    # Push patches that should come before
stg new <patch-name> -m "Description"
# Make changes...
stg refresh
stg push -a                          # Push remaining patches on top
```

## Modifying an Existing Patch

### Edit Patch Content

```bash
stg goto <patch-name>                # Navigate to the patch
# Make changes to files
stg refresh                          # Update patch with changes
stg push -a                          # Reapply patches above
```

### Edit Patch Message

```bash
stg goto <patch-name>
stg refresh -e                       # Opens editor for commit message
stg push -a
```

Or directly without navigating:
```bash
stg edit <patch-name> -m "New commit message"
```

### Amend the Top Patch

If already on the top patch:
```bash
# Make changes...
stg refresh                          # Updates the current top patch
```

## Viewing Patches

```bash
stg series                           # List patches (short)
stg series -d                        # List with descriptions
stg series --empty                   # Show which patches are empty
stg show                             # Show diff of current patch
stg show <patch-name>                # Show diff of specific patch
stg log                              # Show patch application history
```

## Navigating the Stack

```bash
stg pop                              # Pop the top patch
stg pop -a                           # Pop all patches
stg pop -n 3                         # Pop top 3 patches
stg push                             # Push the next unapplied patch
stg push -a                          # Push all unapplied patches
stg goto <patch-name>                # Jump to a specific patch
```

**Rule**: `stg goto` pops/pushes patches as needed to reach the target.
Patches above the target are popped; patches below are pushed.

## Reordering Patches

```bash
# Move a patch to a different position
stg pop -a
stg push <patch-C> <patch-A> <patch-B>   # Push in desired order
```

Or use `stg float` to move a patch to the top:
```bash
stg float <patch-name>               # Moves patch to top of stack
```

## Splitting a Patch

To split a large patch into smaller ones:

```bash
stg goto <patch-to-split>

# Undo the patch content but keep files changed
stg pop --spill

# Now the changes are in the working tree but no patch is applied
# Create first sub-patch
stg new <first-part> -m "First part description"
git add <subset-of-files>
stg refresh

# Create second sub-patch
stg new <second-part> -m "Second part description"
git add <remaining-files>
stg refresh

# Delete the original (now empty or unwanted) patch
stg delete <original-patch-name>

# Reapply remaining patches
stg push -a
```

## Combining Patches

```bash
# Squash a patch into the one below it
stg squash <patch1> <patch2> -m "Combined description"
```

## Deleting a Patch

```bash
stg delete <patch-name>              # Remove patch from stack
stg delete --top                     # Remove top patch
```

**Warning**: `stg delete` discards the patch diff. Ensure the changes are
no longer needed or have been absorbed upstream.

## Renaming a Patch

```bash
stg rename <old-name> <new-name>
```

## Committing Patches Permanently

To convert a patch into a regular git commit (removes it from StGit control):

```bash
stg commit <patch-name>             # Commit specific patch
stg commit -a                       # Commit all applied patches
stg commit -n 3                     # Commit bottom 3 patches
```

**Use case**: When a patch is stable and should no longer be rebased
individually (e.g., infrastructure changes that won't conflict).

**Warning**: Committed patches cannot be un-committed back into StGit
patches. Only commit patches that are truly permanent.

## Exporting Patches

```bash
stg export                           # Export all patches as files
stg export -d /path/to/dir           # Export to specific directory
stg export --stdout                  # Export to stdout (for piping)
```

## Best Practices

1. **One logical change per patch** - Easier to resolve conflicts
   and review individually
2. **Descriptive patch names** - Use numbered prefixes (`01-`, `02-`)
   for ordering clarity
3. **Keep the stack small** - Fewer patches = fewer potential conflicts
   during rebase
4. **Test after modifications** - Run the project's test suite after
   `stg goto` + `stg refresh` + `stg push -a` to catch regressions
5. **Never edit applied patches without StGit** - Always use
   `stg goto` + `stg refresh`, never manual `git commit --amend`
