import { defineLogicFunction } from 'twenty-sdk/define';

type Company = { id: string };
type PostCard = { id: string };

const handler = async (params: {
  company: Company;
  postCards: PostCard[];
}) => {
  return {
    companyId: params.company.id,
    postCardCount: params.postCards.length,
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
