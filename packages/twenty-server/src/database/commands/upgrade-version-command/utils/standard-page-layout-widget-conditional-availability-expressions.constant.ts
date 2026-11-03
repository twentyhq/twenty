import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';

export const STANDARD_PAGE_LAYOUT_WIDGET_CONDITIONAL_AVAILABILITY_EXPRESSIONS: Partial<
  Record<string, string>
> = {
  [STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs
    .conversations.widgets.conversations.universalIdentifier]:
    'featureFlags.IS_AI_CHAT_INBOX_ENABLED',
  [STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.companyRecordPage.tabs
    .conversations.widgets.conversations.universalIdentifier]:
    'featureFlags.IS_AI_CHAT_INBOX_ENABLED',
  [STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.opportunityRecordPage.tabs
    .conversations.widgets.conversations.universalIdentifier]:
    'featureFlags.IS_AI_CHAT_INBOX_ENABLED',
  [STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageCampaignRecordPage.tabs
    .home.widgets.recipients.universalIdentifier]:
    'noneEquals(selectedRecords, "status", "DRAFT")',
  [STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageCampaignRecordPage.tabs
    .home.widgets.fields.universalIdentifier]:
    'noneEquals(selectedRecords, "status", "DRAFT")',
  [STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageListRecordPage.tabs.home
    .widgets.members.universalIdentifier]: 'device == "MOBILE"',
  [STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageListRecordPage.tabs.members
    .widgets.members.universalIdentifier]: 'device == "DESKTOP"',
  [STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.noteRecordPage.tabs.home.widgets
    .noteRichText.universalIdentifier]: 'device == "MOBILE"',
  [STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.noteRecordPage.tabs.note.widgets
    .noteRichText.universalIdentifier]: 'device == "DESKTOP"',
  [STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.taskRecordPage.tabs.home.widgets
    .taskRichText.universalIdentifier]: 'device == "MOBILE"',
  [STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.taskRecordPage.tabs.note.widgets
    .taskRichText.universalIdentifier]: 'device == "DESKTOP"',
};
