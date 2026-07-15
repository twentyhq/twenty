import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

import {
  ASSIGNMENT_TEAM_MEMBER_FIELDS_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  ASSIGNMENT_TEAM_MEMBER_FIELDS_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
  ASSIGNMENT_TEAM_MEMBER_OBJECT_UNIVERSAL_IDENTIFIER,
  ASSIGNMENT_TEAM_MEMBER_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier:
    ASSIGNMENT_TEAM_MEMBER_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Assignment Team Member record page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier:
    ASSIGNMENT_TEAM_MEMBER_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier:
        ASSIGNMENT_TEAM_MEMBER_FIELDS_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Fields',
      position: 0,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier:
            ASSIGNMENT_TEAM_MEMBER_FIELDS_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Assignment Team Member fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
  ],
});
