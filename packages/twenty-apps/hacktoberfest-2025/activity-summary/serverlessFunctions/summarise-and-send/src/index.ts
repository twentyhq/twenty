import { summariseOpportunityCreation } from './opportunity-creation-summariser';
import { summarisePeopleCreation } from './people-creation-summariser';
import { sendToDiscord, sendToSlack, sendToWhatsApp } from './senders';
import { summariseTaskCreation } from './task-creation-summariser';
import { type ServerlessFunctionConfig } from 'twenty-sdk/application';

export const main = async (): Promise<object> => {
  let date: string | Date = new Date();
  date.setDate(new Date().getDate() - Number(process.env.DAYS_AGO));
  date = date.toISOString().substring(0, 10);
  const peopleCreationSummary = await summarisePeopleCreation(date);
  const opportunityCreationSummary = await summariseOpportunityCreation(date);
  const taskCreationSummary = await summariseTaskCreation(date);

  let body = {
    daysAgo: Number(process.env.DAYS_AGO),
    peopleCreationSummary,
    opportunityCreationSummary,
    taskCreationSummary,
    discord: {},
    whatsapp: {},
    slack: {},
  };

  if (process.env.SLACK_HOOK_URL) {
    const slackBody = await sendToSlack({
      peopleCreationSummary,
      opportunityCreationSummary,
      taskCreationSummary,
    });

    body = {
      ...body,
      slack: slackBody,
    };
  }

  if (process.env.DISCORD_WEBHOOK_URL) {
    const discordBody = await sendToDiscord({
      peopleCreationSummary,
      opportunityCreationSummary,
      taskCreationSummary,
    });

    body = {
      ...body,
      discord: discordBody,
    };
  }

  if (
    process.env.FB_GRAPH_TOKEN &&
    process.env.WHATSAPP_RECIPIENT_PHONE_NUMBER
  ) {
    const whatsappBody = await sendToWhatsApp({
      peopleCreationSummary,
      opportunityCreationSummary,
      taskCreationSummary,
    });

    body = {
      ...body,
      whatsapp: whatsappBody,
    };
  }

  return body;
};

export const config: ServerlessFunctionConfig = {
  universalIdentifier: 'c5b0e3f7-cbbd-4bd6-b01c-150d52cf2ce9',
  name: 'summarise-and-send',
  triggers: [
    {
      universalIdentifier: '36e1c4c7-8664-4d6d-a88f-ac56f1bd0651',
      type: 'cron',
      pattern: '0 9 * * *',
    },
  ],
};
