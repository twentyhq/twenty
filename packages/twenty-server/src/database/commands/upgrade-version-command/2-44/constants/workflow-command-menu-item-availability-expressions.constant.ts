export const WORKFLOW_COMMAND_MENU_ITEM_AVAILABILITY_EXPRESSIONS: {
  universalIdentifier: string;
  previousExpression: string;
  nextExpression: string;
}[] = [
  {
    universalIdentifier: '57f21a06-a17a-47b1-a123-90d90dbdf0b7',
    previousExpression:
      'everyEquals(selectedRecords, "currentVersion.status", "ACTIVE") and noneDefined(selectedRecords, "deletedAt")',
    nextExpression:
      'includesEvery(selectedRecords, "statuses", "ACTIVE") and noneDefined(selectedRecords, "deletedAt")',
  },
  {
    universalIdentifier: '818117fa-6cad-4ebc-83c1-40f4afc28d94',
    previousExpression:
      'pageType == "RECORD_PAGE" and everyDefined(selectedRecords, "currentVersion.trigger") and everyDefined(selectedRecords, "currentVersion.steps") and every(selectedRecords, "currentVersion.steps.length") and noneDefined(selectedRecords, "deletedAt")',
    nextExpression:
      'pageType == "RECORD_PAGE" and everyDefined(selectedRecords, "currentVersion.trigger") and everyDefined(selectedRecords, "currentVersion.steps") and every(selectedRecords, "currentVersion.steps.length") and noneDefined(selectedRecords, "deletedAt") and not featureFlags.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED',
  },
];
