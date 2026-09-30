import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

const saveChecklistHandler = async (checklist: {
  items: { label: string; isDone?: boolean }[];
}) => {
  const { createChecklist } = await new CoreApiClient().mutation({
    createChecklist: {
      __args: { data: checklist },
      items: true,
    },
  });

  return createChecklist?.items;
};

export default defineLogicFunction({
  universalIdentifier: '8ff73eeb-2d59-43bc-8c34-10eaba0b488d',
  name: 'save-checklist',
  timeoutSeconds: 30,
  handler: saveChecklistHandler,
});
