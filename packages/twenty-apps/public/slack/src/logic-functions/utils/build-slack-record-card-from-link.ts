import { type SlackRecordCard } from 'src/logic-functions/types/slack-record-card.type';
import { type SlackRecordLink } from 'src/logic-functions/types/slack-record-link.type';
import { formatSlackObjectLabel } from 'src/logic-functions/utils/format-slack-object-label';

// The link the agent wrote already carries a record name and a page to open,
// so a card can be built without reading the record back.
export const buildSlackRecordCardFromLink = ({
  recordLink,
  objectLabel,
}: {
  recordLink: SlackRecordLink;
  objectLabel?: string;
}): SlackRecordCard => ({
  recordName: recordLink.linkLabel,
  objectLabel:
    objectLabel ?? formatSlackObjectLabel(recordLink.objectNameSingular),
  recordUrl: recordLink.recordUrl,
  details: [],
});
