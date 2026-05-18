import { defineObject, FieldType } from 'twenty-sdk/define';

export const XOPURE_SYNC_CURSOR_OBJECT_ID = '32cb558a-2058-4da8-a3df-ccd469dd0229';

export default defineObject({
  universalIdentifier: XOPURE_SYNC_CURSOR_OBJECT_ID,
  nameSingular: 'xopureSyncCursor',
  namePlural: 'xopureSyncCursors',
  labelSingular: 'XO Pure Sync Cursor',
  labelPlural: 'XO Pure Sync Cursors',
  description: 'Cursor tracking for backfill and reconciliation runs.',
  icon: 'IconPlayerTrackNext',
  fields: [
    { universalIdentifier: 'f100f73c-ef53-422d-8857-9236a3dfe70b', type: FieldType.TEXT, name: 'step', label: 'Step', icon: 'IconHash', isUnique: true },
    { universalIdentifier: '1be93780-23c2-4390-8740-9a51d2e5cfc8', type: FieldType.TEXT, name: 'cursorValue', label: 'Cursor value', icon: 'IconClock', isNullable: true, defaultValue: null },
    { universalIdentifier: '4e281657-3ad4-40a7-b5ef-24b28160a5fd', type: FieldType.TEXT, name: 'lastRunStatus', label: 'Last run status', icon: 'IconProgressCheck' },
    { universalIdentifier: '1cf79e71-4254-4840-9a0a-41152c3dfabd', type: FieldType.DATE_TIME, name: 'lastRunAt', label: 'Last run at', icon: 'IconCalendar', isNullable: true, defaultValue: null },
    { universalIdentifier: 'b23194af-f739-49c5-9671-553ebe4ef54e', type: FieldType.TEXT, name: 'lastErrorSummary', label: 'Last error summary', icon: 'IconAlertCircle', isNullable: true, defaultValue: null },
  ],
});
