import {
  SUMMARIZE_PERSON_RECORDINGS_COMMAND_UNIVERSAL_IDENTIFIER,
  SUMMARIZE_PERSON_RECORDINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/summarize-person-recordings-universal-identifiers';
import {
  Action,
  defineFrontComponent,
  openAskAIWithPrompt,
  useRecordId,
} from 'twenty-sdk';
import Twenty from 'twenty-sdk/generated';
import { isDefined } from 'twenty-shared/utils';

const SummarizePersonRecordings = () => {
  const personRecordId = useRecordId();

  const execute = async () => {
    if (!isDefined(personRecordId)) {
      throw new Error('No person record selected');
    }

    const client = new Twenty();

    const personResult: any = await client.query({
      person: {
        __args: {
          filter: { id: { eq: personRecordId } },
        },
        id: true,
        callRecordingId: true,
      },
    });

    const callRecordingId = personResult?.person?.callRecordingId;

    if (!isDefined(callRecordingId)) {
      throw new Error('No call recording linked to this person');
    }

    const { callRecording }: any = await client.query({
      callRecording: {
        __args: {
          filter: { id: { eq: callRecordingId } },
        },
        id: true,
        name: true,
        summary: { markdown: true },
        createdAt: true,
      },
    });

    if (!isDefined(callRecording)) {
      throw new Error('Call recording not found');
    }

    const recordings = [callRecording];

    const summariesText = recordings
      .map(
        (recording: any, index: number) =>
          `### ${index + 1}. ${recording.name ?? 'Untitled'} (${recording.createdAt})\n${recording.summary?.markdown ?? 'No summary available'}`,
      )
      .join('\n\n---\n\n');

    const prompt = [
      `Here is the summary of the latest call recording linked to this person:`,
      '',
      summariesText,
      '',
      'Using the "Call Transcript Summarization" skill as a guide for structure,',
      'generate a detailed summary of this call.',
      'Highlight key themes, action items, and any risks or opportunities.',
    ].join('\n');

    await openAskAIWithPrompt({ prompt });
  };

  return <Action execute={execute} />;
};

export default defineFrontComponent({
  universalIdentifier:
    SUMMARIZE_PERSON_RECORDINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Summarize Person Call Recordings',
  description:
    'Generates a summary of recent call recordings for a person using Ask AI',
  component: SummarizePersonRecordings,
  isHeadless: true,
  command: {
    universalIdentifier:
      SUMMARIZE_PERSON_RECORDINGS_COMMAND_UNIVERSAL_IDENTIFIER,
    label: 'Summarize call recordings',
    icon: 'IconSparkles',
    isPinned: false,
    availabilityType: 'SINGLE_RECORD',
    availabilityObjectUniversalIdentifier:
      '20202020-e674-48e5-a542-72570eee7213',
  },
});
