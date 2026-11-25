import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';

const RECORD_PAGES_WITH_MESSAGES_TAB = [
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.companyRecordPage,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.opportunityRecordPage,
];

export const MESSAGES_TAB_MIGRATION_UNIVERSAL_IDENTIFIERS: {
  tabs: string[];
  widgets: string[];
} = {
  tabs: RECORD_PAGES_WITH_MESSAGES_TAB.map(
    (recordPage) => recordPage.tabs.emails.universalIdentifier,
  ),
  widgets: RECORD_PAGES_WITH_MESSAGES_TAB.map(
    (recordPage) => recordPage.tabs.emails.widgets.emails.universalIdentifier,
  ),
};
