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
import { CoreApiClient } from 'twenty-sdk/generated';
import { isDefined } from 'twenty-shared/utils';

const SummarizePersonRecordings = () => {
  const personRecordId = useRecordId();

  const execute = async () => {
    if (!isDefined(personRecordId)) {
      throw new Error('No person record selected');
    }

    const client = new CoreApiClient();

    const result: any = await client.query({
      callRecordings: {
        __args: {
          filter: { personId: { eq: personRecordId } },
        },
        edges: {
          node: {
            id: true,
            name: true,
            summary: { markdown: true },
            createdAt: true,
          },
        },
      },
    });

    const recordings =
      result?.callRecordings?.edges?.map(
        (edge: any) => edge.node,
      ) ?? [];

    if (!recordings.length) {
      throw new Error('No call recordings linked to this person');
    }

    const summariesText = recordings
      .map(
        (recording: any, index: number) =>
          `### ${index + 1}. ${recording.name ?? 'Untitled'} (${recording.createdAt})\n${recording.summary?.markdown ?? 'No summary available'}`,
      )
      .join('\n\n---\n\n');

    const prompt = [
      `Here are the summaries of ${recordings.length} call recording(s) linked to this person:`,
      '',
      summariesText,
      '',
      'Using the "Call Transcript Summarization" skill as a guide for structure,',
      'generate a detailed summary of these calls.',
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
