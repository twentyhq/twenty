import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';

const RECORD_PAGES_WITH_MESSAGES_TAB = [
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.companyRecordPage,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.opportunityRecordPage,
];

export const MESSAGES_TAB_UNIVERSAL_IDENTIFIERS: string[] =
  RECORD_PAGES_WITH_MESSAGES_TAB.map(
    (recordPage) => recordPage.tabs.emails.universalIdentifier,
  );

export const MESSAGES_WIDGET_UNIVERSAL_IDENTIFIERS: string[] =
  RECORD_PAGES_WITH_MESSAGES_TAB.map(
    (recordPage) => recordPage.tabs.emails.widgets.emails.universalIdentifier,
  );
