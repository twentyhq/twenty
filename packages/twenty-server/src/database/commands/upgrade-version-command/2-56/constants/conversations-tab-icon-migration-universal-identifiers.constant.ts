import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';

export const CONVERSATIONS_TAB_ICON_MIGRATION_UNIVERSAL_IDENTIFIERS: string[] =
  [
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.companyRecordPage,
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage,
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.opportunityRecordPage,
  ].map((recordPage) => recordPage.tabs.conversations.universalIdentifier);
