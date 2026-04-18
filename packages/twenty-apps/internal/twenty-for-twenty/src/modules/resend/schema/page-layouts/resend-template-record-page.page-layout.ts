import {
  RESEND_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  RESEND_TEMPLATE_RECORD_PAGE_FILES_TAB_UNIVERSAL_IDENTIFIER,
  RESEND_TEMPLATE_RECORD_PAGE_FILES_WIDGET_UNIVERSAL_IDENTIFIER,
  RESEND_TEMPLATE_RECORD_PAGE_HOME_FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
  RESEND_TEMPLATE_RECORD_PAGE_HOME_TAB_UNIVERSAL_IDENTIFIER,
  RESEND_TEMPLATE_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  RESEND_TEMPLATE_RECORD_PAGE_NOTES_TAB_UNIVERSAL_IDENTIFIER,
  RESEND_TEMPLATE_RECORD_PAGE_NOTES_WIDGET_UNIVERSAL_IDENTIFIER,
  RESEND_TEMPLATE_RECORD_PAGE_PREVIEW_TAB_UNIVERSAL_IDENTIFIER,
  RESEND_TEMPLATE_RECORD_PAGE_PREVIEW_WIDGET_UNIVERSAL_IDENTIFIER,
  RESEND_TEMPLATE_RECORD_PAGE_TASKS_TAB_UNIVERSAL_IDENTIFIER,
  RESEND_TEMPLATE_RECORD_PAGE_TASKS_WIDGET_UNIVERSAL_IDENTIFIER,
  RESEND_TEMPLATE_RECORD_PAGE_TIMELINE_TAB_UNIVERSAL_IDENTIFIER,
  RESEND_TEMPLATE_RECORD_PAGE_TIMELINE_WIDGET_UNIVERSAL_IDENTIFIER,
  TEMPLATE_HTML_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/modules/resend/constants/universal-identifiers';
import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

export default definePageLayout({
  universalIdentifier: RESEND_TEMPLATE_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Resend Template Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: RESEND_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: RESEND_TEMPLATE_RECORD_PAGE_HOME_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Home',
      position: 50,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier:
            RESEND_TEMPLATE_RECORD_PAGE_HOME_FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
    {
      universalIdentifier:
        RESEND_TEMPLATE_RECORD_PAGE_PREVIEW_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Preview',
      position: 75,
      icon: 'IconEye',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier:
            RESEND_TEMPLATE_RECORD_PAGE_PREVIEW_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Template Preview',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              TEMPLATE_HTML_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier:
        RESEND_TEMPLATE_RECORD_PAGE_TIMELINE_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Timeline',
      position: 100,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier:
            RESEND_TEMPLATE_RECORD_PAGE_TIMELINE_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: {
            configurationType: 'TIMELINE',
          },
        },
      ],
    },
    {
      universalIdentifier:
        RESEND_TEMPLATE_RECORD_PAGE_TASKS_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Tasks',
      position: 200,
      icon: 'IconCheckbox',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier:
            RESEND_TEMPLATE_RECORD_PAGE_TASKS_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Tasks',
          type: 'TASKS',
          configuration: {
            configurationType: 'TASKS',
          },
        },
      ],
    },
    {
      universalIdentifier:
        RESEND_TEMPLATE_RECORD_PAGE_NOTES_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Notes',
      position: 300,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier:
            RESEND_TEMPLATE_RECORD_PAGE_NOTES_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Notes',
          type: 'NOTES',
          configuration: {
            configurationType: 'NOTES',
          },
        },
      ],
    },
    {
      universalIdentifier:
        RESEND_TEMPLATE_RECORD_PAGE_FILES_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Files',
      position: 400,
      icon: 'IconPaperclip',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier:
            RESEND_TEMPLATE_RECORD_PAGE_FILES_WIDGET_UNIVERSAL_IDENTIFIER,
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
