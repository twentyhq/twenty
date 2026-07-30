import {
  type LastContact,
  type PersonAgg,
  type RecordUpdateData,
} from 'src/utils/last-contact/types';

export const personLastContact = (agg: PersonAgg): LastContact | undefined =>
  agg.lastContactAt && agg.item
    ? { at: agg.lastContactAt, item: agg.item }
    : undefined;

// Companies and opportunities only mirror the date and the item, never the
// direction or the team member.
export const buildRelatedData = (
  lastContact: LastContact | undefined,
): RecordUpdateData =>
  lastContact
    ? {
        lastContactAt: lastContact.at,
        lastContactItemMessageId:
          lastContact.item.kind === 'email' ? lastContact.item.id : null,
        lastContactItemCalendarEventId:
          lastContact.item.kind === 'meeting' ? lastContact.item.id : null,
      }
    : {
        lastContactAt: null,
        lastContactItemMessageId: null,
        lastContactItemCalendarEventId: null,
      };
