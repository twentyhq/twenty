import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type BriefTargetType } from 'src/constants/target-types';

export type BriefFieldValues = {
  briefMarkdown: string;
  sentiment: string;
  generatedAt: string;
};

const TARGET_UPDATE_MUTATIONS: Record<BriefTargetType, string> = {
  company: 'updateCompany',
  person: 'updatePerson',
};

export const updateBriefFields = async ({
  client,
  targetType,
  recordId,
  values,
}: {
  client: CoreApiClient;
  targetType: BriefTargetType;
  recordId: string;
  values: BriefFieldValues;
}): Promise<void> => {
  await client.mutation({
    [TARGET_UPDATE_MUTATIONS[targetType]]: {
      __args: {
        id: recordId,
        data: {
          // Rich text composite: markdown in, blocknote stays null (the
          // server derives the editor payload the same way call-recorder does).
          aiBrief: { blocknote: null, markdown: values.briefMarkdown },
          aiBriefUpdatedAt: values.generatedAt,
          aiSentiment: values.sentiment,
        },
      },
      id: true,
    },
  });
};
