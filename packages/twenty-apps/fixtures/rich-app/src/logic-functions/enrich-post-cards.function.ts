import { defineLogicFunction, type TwentyRecord } from 'twenty-sdk/define';

const handler = async (params: {
  companyId: TwentyRecord<'20202020-b374-4779-a561-80086cb2e17f'>;
  postCardIds: TwentyRecord<'54b589ca-eeed-4950-a176-358418b85c05'>[];
}) => {
  return {
    companyId: params.companyId,
    postCardCount: params.postCardIds.length,
  };
};

export default defineLogicFunction({
  universalIdentifier: 'a1b2c3d4-ac10-4a7b-8c9d-0e1f2a3b4c5d',
  name: 'enrich-post-cards',
  description: 'Enrich post cards of a company',
  timeoutSeconds: 5,
  handler,
  workflowActionTriggerSettings: {
    label: 'Enrich Post Cards',
    icon: 'IconMail',
  },
});
