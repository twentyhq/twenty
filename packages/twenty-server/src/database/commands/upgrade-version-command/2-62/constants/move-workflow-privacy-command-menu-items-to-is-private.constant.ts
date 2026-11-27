export const WORKFLOW_PRIVACY_COMMAND_MENU_ITEM_EXPRESSIONS = [
  {
    universalIdentifier: '26f98606-8b6e-42f2-bc97-2cfc4359bada',
    legacyExpression:
      'numberOfSelectedRecords == 1 and everyEquals(selectedRecords, "visibility", "WORKSPACE") and every(selectedRecords, "canChangeVisibility") and noneDefined(selectedRecords, "deletedAt") and noneEquals(selectedRecords, "recordPermissions.canUpdate", false)',
    expression:
      'numberOfSelectedRecords == 1 and none(selectedRecords, "isPrivate") and every(selectedRecords, "canChangeVisibility") and noneDefined(selectedRecords, "deletedAt") and noneEquals(selectedRecords, "recordPermissions.canUpdate", false)',
  },
  {
    universalIdentifier: '37745922-ba18-4bea-a1da-8625ad22d233',
    legacyExpression:
      'numberOfSelectedRecords == 1 and everyEquals(selectedRecords, "visibility", "PRIVATE") and every(selectedRecords, "canChangeVisibility") and noneDefined(selectedRecords, "deletedAt")',
    expression:
      'numberOfSelectedRecords == 1 and every(selectedRecords, "isPrivate") and every(selectedRecords, "canChangeVisibility") and noneDefined(selectedRecords, "deletedAt")',
  },
] as const;
