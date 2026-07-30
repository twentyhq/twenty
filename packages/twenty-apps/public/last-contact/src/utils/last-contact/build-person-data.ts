import {
  type PersonAgg,
  type RecordUpdateData,
} from 'src/utils/last-contact/types';

export type BuildMode = 'advance-only' | 'overwrite';

// 'advance-only' omits keys with no computed value so an existing value survives,
// which is what the install backfill wants. 'overwrite' always writes every key,
// nulling the ones with no computed value, so an on-demand recompute can clear
// values left behind by deleted messages, canceled events or moved people.
export const buildPersonData = (
  agg: PersonAgg,
  mode: BuildMode = 'advance-only',
): RecordUpdateData => {
  const isOverwrite = mode === 'overwrite';
  const data: RecordUpdateData = {};

  if (agg.lastContactAt) {
    data.lastContactAt = agg.lastContactAt;
    data.lastContactById = agg.lastContactById ?? null;
  } else if (isOverwrite) {
    data.lastContactAt = null;
    data.lastContactById = null;
  }

  if (agg.lastOutboundAt) {
    data.lastOutboundAt = agg.lastOutboundAt;
  } else if (isOverwrite) {
    data.lastOutboundAt = null;
  }

  if (agg.lastInboundAt) {
    data.lastInboundAt = agg.lastInboundAt;
  } else if (isOverwrite) {
    data.lastInboundAt = null;
  }

  if (agg.lastEmail) {
    data.lastEmailId = agg.lastEmail.id;
  } else if (isOverwrite) {
    data.lastEmailId = null;
  }

  if (agg.lastMeeting) {
    data.lastMeetingId = agg.lastMeeting.id;
  } else if (isOverwrite) {
    data.lastMeetingId = null;
  }

  if (agg.item?.kind === 'email') {
    data.lastContactItemMessageId = agg.item.id;
    data.lastContactItemCalendarEventId = null;
  } else if (agg.item?.kind === 'meeting') {
    data.lastContactItemCalendarEventId = agg.item.id;
    data.lastContactItemMessageId = null;
  } else if (isOverwrite) {
    data.lastContactItemMessageId = null;
    data.lastContactItemCalendarEventId = null;
  }

  return data;
};
