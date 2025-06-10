# Adding a New Standard Object

This document outlines the steps required to add a new standard object to the system.

## 1. Create the Workspace Entity

Create a new file under `packages/twenty-server/src/modules/[object-name]/standard-objects/[object-name].workspace-entity.ts` with:

- Basic entity definition with `@WorkspaceEntity` decorator
- All required fields with `@WorkspaceField` decorators
- Relations with `@WorkspaceRelation` decorators
- Search vector configuration
- Duplicate criteria if needed
- Import and use `@WorkspaceIsNotAuditLogged` decorator if the object should not be audit logged
- Add proper TypeScript types for all fields
- Add proper validation decorators where needed
- Add proper field options (nullable, unique, etc.)

## 2. Add Standard Field IDs

In `packages/twenty-server/src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids.ts`:

- Add `[OBJECT]_STANDARD_FIELD_IDS` constant with all field IDs
- Add the object to `STANDARD_OBJECT_FIELD_IDS`
- Add field IDs for relations in:
  - `ACTIVITY_TARGET_STANDARD_FIELD_IDS`
  - `ATTACHMENT_STANDARD_FIELD_IDS`
  - `EVENT_STANDARD_FIELD_IDS`
  - `TIMELINE_ACTIVITY_STANDARD_FIELD_IDS`
  - `FAVORITE_STANDARD_FIELD_IDS`
  - `NOTE_TARGET_STANDARD_FIELD_IDS`
  - `OPPORTUNITY_STANDARD_FIELD_IDS`
- Ensure all field IDs follow the pattern `20202020-XXXX-XXXX-XXXX-XXXXXXXXXXXX`
- Add any custom field IDs needed for specific object features
- Add field IDs for any custom relations

## 3. Add Standard Object IDs and Icons

In `packages/twenty-server/src/engine/workspace-manager/workspace-sync-metadata/constants/`:

- Add object ID to `standard-object-ids.ts`
- Add icon to `standard-object-icons.ts`
- Ensure object ID follows the pattern `20202020-XXXX-XXXX-XXXX-XXXXXXXXXXXX`
- Choose an appropriate icon from the available icon set that matches the object's purpose
- Add any custom object IDs needed for specific features

## 4. Create Default View

Create a new file under `packages/twenty-server/src/engine/workspace-manager/standard-objects-prefill-data/views/[object-name]-all.view.ts` with:

- View name and configuration
- Default columns
- Default sorting
- Field visibility settings
- Column widths and positions
- Default filters if needed
- View type (table, kanban, etc.)
- View options (enable/disable features)
- Default view settings
- View metadata (description, etc.)
- View permissions if needed

## 5. Update Navigation and Search

In `packages/twenty-front/src/modules/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems.tsx`:
- Add object to `ORDERED_STANDARD_OBJECTS`
- Consider the logical placement in the navigation order
- Add any custom navigation items if needed

In `packages/twenty-server/src/engine/core-modules/search/constants/standard-objects-by-priority-rank.ts`:
- Add object to `STANDARD_OBJECTS_BY_PRIORITY_RANK`
- Set appropriate priority rank (1-10, where 1 is highest priority)
- Add any custom search fields if needed

## 6. Add Navigation Action

In `packages/twenty-front/src/modules/action-menu/actions/record-actions/`:

- Add action key to `NoSelectionRecordActionsKeys.ts`
- Add action configuration to `DefaultRecordActionsConfig.tsx`
- Add object names to `CoreObjectNameSingular.ts` and `CoreObjectNamePlural.ts`
- Configure any object-specific actions
- Set up proper action permissions and visibility
- Add any custom action handlers
- Configure action display conditions

## 7. Update Workspace Configuration

In `packages/twenty-server/src/engine/core-modules/workspace/dtos/update-workspace-input.ts`:
- Add object to feature flags array
- Add any object-specific feature flags if needed
- Configure workspace-level settings for the object
- Add any custom workspace configurations

## 8. Register Standard Object

In `packages/twenty-server/src/engine/workspace-manager/standard-objects-prefill-data/standard-objects-prefill-data.ts`:
- Add object to `standardObjectMetadataDefinitions`
- Configure object metadata (name, label, description)
- Set up any object-specific configurations
- Add any custom metadata fields
- Configure object display settings

## 9. Update View Seeding

In `packages/twenty-server/src/engine/workspace-manager/standard-objects-prefill-data/seed-view-with-demo-data.ts`:
- Import and add the object's view to `viewDefinitions`
- Configure demo data if needed
- Set up any object-specific view configurations
- Add any custom view settings
- Configure view seeding options

## 10. Add Object Relations

In the workspace entity file:
- Define all necessary relations with other objects
- Set up proper relation types (OneToMany, ManyToOne, etc.)
- Configure relation options (cascade, eager loading, etc.)
- Add any custom relation fields
- Configure relation constraints
- Set up relation validation rules
- Add any custom relation handlers

## 11. Add Object Permissions

In `packages/twenty-server/src/engine/core-modules/workspace/dtos/`:
- Add object to workspace member permissions
- Configure default permissions for new workspaces
- Set up any object-specific permission rules
- Add any custom permission checks
- Configure permission inheritance
- Set up role-based access control

## 12. Add Object Validation

In the workspace entity file:
- Add field-level validation rules
- Add entity-level validation rules
- Configure validation messages
- Set up custom validation logic
- Add any business rule validations
- Configure validation error handling

## 13. Add Object Events

In the workspace entity file:
- Configure entity lifecycle events
- Add custom event handlers
- Set up event listeners
- Configure event propagation
- Add any custom event types
- Set up event logging

## Required Files

1. `packages/twenty-server/src/modules/[object-name]/standard-objects/[object-name].workspace-entity.ts`
2. `packages/twenty-server/src/engine/workspace-manager/standard-objects-prefill-data/views/[object-name]-all.view.ts`

## Files to Modify

1. `packages/twenty-server/src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids.ts`
2. `packages/twenty-server/src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids.ts`
3. `packages/twenty-server/src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons.ts`
4. `packages/twenty-front/src/modules/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems.tsx`
5. `packages/twenty-server/src/engine/core-modules/search/constants/standard-objects-by-priority-rank.ts`
6. `packages/twenty-front/src/modules/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys.ts`
7. `packages/twenty-front/src/modules/action-menu/actions/record-actions/constants/DefaultRecordActionsConfig.tsx`
8. `packages/twenty-front/src/modules/object-metadata/types/CoreObjectNameSingular.ts`
9. `packages/twenty-front/src/modules/object-metadata/types/CoreObjectNamePlural.ts`
10. `packages/twenty-server/src/engine/core-modules/workspace/dtos/update-workspace-input.ts`
11. `packages/twenty-server/src/engine/workspace-manager/standard-objects-prefill-data/standard-objects-prefill-data.ts`
12. `packages/twenty-server/src/engine/workspace-manager/standard-objects-prefill-data/seed-view-with-demo-data.ts`

## Notes

- All field IDs should follow the pattern `20202020-XXXX-XXXX-XXXX-XXXXXXXXXXXX`
- Object IDs should be unique and follow the same pattern
- Icons should be chosen from the available icon set
- Views should be consistent with existing object views
- Navigation order should be logical and consistent
- Search priority should be set based on object importance
- Consider adding demo data for testing and demonstration
- Ensure all relations are properly configured
- Test the object's integration with all related features
- Verify permissions and access control
- Check for any potential conflicts with existing objects
- Document any object-specific features or requirements
- Follow TypeScript best practices
- Ensure proper error handling
- Add appropriate logging
- Consider performance implications
- Add necessary tests
- Update documentation
- Consider backward compatibility
- Plan for future extensibility 