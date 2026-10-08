import {
  ON_DEMAND_FIELD_STORY_RECORD_ID,
  ON_DEMAND_FIELD_STORY_UPDATED_AT,
} from '@/object-record/record-field/on-demand/testing/seedOnDemandFieldStory';

export const ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT =
  'The customer asked for a follow-up call.';

export const ON_DEMAND_FIELD_STORY_RESPONSE = {
  data: {
    callRecording: {
      id: ON_DEMAND_FIELD_STORY_RECORD_ID,
      __typename: 'CallRecording',
      updatedAt: ON_DEMAND_FIELD_STORY_UPDATED_AT,
      transcript: { text: ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT },
    },
  },
};
