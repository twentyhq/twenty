import {
  ATTENDEES_EDITOR_FRONT_COMPONENT_UID,
  EXTRACT_TASKS_PANEL_UID,
  SALES_NOTE_BODY_FIELD_UID,
  SALES_NOTE_DETAILS_ATTENDEES_WIDGET_UID,
  SALES_NOTE_DETAILS_COMPANY_WIDGET_UID,
  SALES_NOTE_DETAILS_OPPORTUNITY_WIDGET_UID,
  SALES_NOTE_DETAILS_OWNER_WIDGET_UID,
  SALES_NOTE_DETAILS_STATUS_WIDGET_UID,
  SALES_NOTE_EXTRACT_TASKS_WIDGET_UID,
  SALES_NOTE_FILES_WIDGET_UID,
  SALES_NOTE_LINKED_TASKS_WIDGET_UID,
  SALES_NOTE_NOTES_EDITOR_WIDGET_UID,
  SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  SALES_NOTE_PAGE_LAYOUT_UID,
  SALES_NOTE_STATUS_FIELD_UID,
  SALES_NOTE_SUMMARY_VIEWER_UID,
  SALES_NOTE_SUMMARY_WIDGET_UID,
  SALES_NOTE_TAB_DETAILS_UID,
  SALES_NOTE_TAB_FILES_UID,
  SALES_NOTE_TAB_LINKED_TASKS_UID,
  SALES_NOTE_TAB_NOTES_EDITOR_UID,
  SALES_NOTE_TAB_SUMMARY_UID,
  SALES_NOTE_TAB_TASKS_UID,
  SALES_NOTE_TO_COMPANY_FIELD_UID,
  SALES_NOTE_TO_OPPORTUNITY_FIELD_UID,
  SALES_NOTE_TO_OWNER_FIELD_UID,
} from 'src/constants/universal-identifiers';
import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

// Tabs (in display order):
//   - Details: VERTICAL_LIST + FIELDS widget — auto-renders the visible fields
//     from the salesNote view (owner, status, company, opportunity,
//     attendees, etc). v0.2.4 added; without it the side panel is the only
//     surface for these fields and isn't always discoverable.
//   - Notes: rich-text body editor.
//   - Summary: AI-generated digest (front-component).
//   - Extract tasks: front-component that proposes follow-ups.
//   - Linked tasks: standard TASKS widget.
//   - Files: reserved for #103 voice notes.
export default definePageLayout({
  universalIdentifier: SALES_NOTE_PAGE_LAYOUT_UID,
  name: 'Sales Note Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: SALES_NOTE_TAB_DETAILS_UID,
      title: 'Details',
      position: 0,
      icon: 'IconInfoCircle',
      // Five individual FIELD widgets in a VERTICAL_LIST. The single FIELDS
      // multi-widget didn't work in v0.2.4: with no backing FIELDS_WIDGET-
      // type view, the widget rendered only a subset of fields AND the
      // user's "Edit layout" save failed (Twenty had no view to update).
      // Using FIELD widgets one-per-field sidesteps both issues.
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: SALES_NOTE_DETAILS_OWNER_WIDGET_UID,
          title: 'Owner',
          type: 'FIELD',
          gridPosition: { row: 0, column: 0, rowSpan: 1, columnSpan: 12 },
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: SALES_NOTE_TO_OWNER_FIELD_UID,
            fieldDisplayMode: 'FIELD',
          },
        },
        {
          universalIdentifier: SALES_NOTE_DETAILS_STATUS_WIDGET_UID,
          title: 'Status',
          type: 'FIELD',
          gridPosition: { row: 1, column: 0, rowSpan: 1, columnSpan: 12 },
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: SALES_NOTE_STATUS_FIELD_UID,
            fieldDisplayMode: 'FIELD',
          },
        },
        {
          universalIdentifier: SALES_NOTE_DETAILS_COMPANY_WIDGET_UID,
          title: 'Account',
          type: 'FIELD',
          gridPosition: { row: 2, column: 0, rowSpan: 1, columnSpan: 12 },
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: SALES_NOTE_TO_COMPANY_FIELD_UID,
            fieldDisplayMode: 'FIELD',
          },
        },
        {
          universalIdentifier: SALES_NOTE_DETAILS_OPPORTUNITY_WIDGET_UID,
          title: 'Opportunity',
          type: 'FIELD',
          gridPosition: { row: 3, column: 0, rowSpan: 1, columnSpan: 12 },
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: SALES_NOTE_TO_OPPORTUNITY_FIELD_UID,
            fieldDisplayMode: 'FIELD',
          },
        },
        {
          // v0.2.7 — was a plain FIELD widget; replaced with a custom
          // FRONT_COMPONENT because Twenty's standard inline editor for an
          // O2M-junction relation only knows how to *create* a new
          // junction record, never to *pick an existing Person*. The
          // attendees-editor exposes a real Person search + click-to-link.
          universalIdentifier: SALES_NOTE_DETAILS_ATTENDEES_WIDGET_UID,
          title: 'Attendees',
          type: 'FRONT_COMPONENT',
          gridPosition: { row: 4, column: 0, rowSpan: 1, columnSpan: 12 },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              ATTENDEES_EDITOR_FRONT_COMPONENT_UID,
          },
        },
      ],
    },
    {
      universalIdentifier: SALES_NOTE_TAB_NOTES_EDITOR_UID,
      title: 'Notes',
      position: 25,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: SALES_NOTE_NOTES_EDITOR_WIDGET_UID,
          title: 'Body',
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: SALES_NOTE_BODY_FIELD_UID,
            fieldDisplayMode: 'EDITOR',
          },
        },
      ],
    },
    {
      universalIdentifier: SALES_NOTE_TAB_SUMMARY_UID,
      title: 'Summary',
      position: 50,
      icon: 'IconSparkles',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: SALES_NOTE_SUMMARY_WIDGET_UID,
          title: 'Summary',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier: SALES_NOTE_SUMMARY_VIEWER_UID,
          },
        },
      ],
    },
    {
      universalIdentifier: SALES_NOTE_TAB_TASKS_UID,
      title: 'Extract tasks',
      position: 100,
      icon: 'IconWand',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: SALES_NOTE_EXTRACT_TASKS_WIDGET_UID,
          title: 'Extract tasks from notes',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier: EXTRACT_TASKS_PANEL_UID,
          },
        },
      ],
    },
    {
      universalIdentifier: SALES_NOTE_TAB_LINKED_TASKS_UID,
      title: 'Linked tasks',
      position: 150,
      icon: 'IconCheckbox',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: SALES_NOTE_LINKED_TASKS_WIDGET_UID,
          title: 'Linked tasks',
          type: 'TASKS',
          configuration: {
            configurationType: 'TASKS',
          },
        },
      ],
    },
    {
      universalIdentifier: SALES_NOTE_TAB_FILES_UID,
      title: 'Files',
      position: 200,
      icon: 'IconPaperclip',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: SALES_NOTE_FILES_WIDGET_UID,
          title: 'Files',
          type: 'FILES',
          configuration: {
            configurationType: 'FILES',
          },
        },
      ],
    },
  ],
});
