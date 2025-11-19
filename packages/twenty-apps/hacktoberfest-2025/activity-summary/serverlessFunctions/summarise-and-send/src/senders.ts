export const sendToSlack = async (params: {
  peopleCreationSummary: string;
  opportunityCreationSummary: string;
  taskCreationSummary: string;
}) => {
  const {
    peopleCreationSummary,
    opportunityCreationSummary,
    taskCreationSummary,
  } = params;

  const slackMessage = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `Bonjour! 🥖 Je m'appelle Kylian Mbaguette. Over the last ${process.env.DAYS_AGO} days`,
          emoji: true,
        },
      },
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🧑‍💻 People & Companies',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'plain_text',
          text: peopleCreationSummary,
          emoji: true,
        },
      },
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🎯 Opportunities',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'plain_text',
          text: opportunityCreationSummary,
          emoji: true,
        },
      },
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📋 Tasks',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'plain_text',
          text: taskCreationSummary,
          emoji: true,
        },
      },
    ],
  };

  const response = await fetch(process.env.SLACK_HOOK_URL ?? '', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slackMessage),
  });

  return {
    formattedMessage: slackMessage,
    webhookStatus: response.status,
  };
};

export const sendToDiscord = async (params: {
  peopleCreationSummary: string;
  opportunityCreationSummary: string;
  taskCreationSummary: string;
}) => {
  const {
    peopleCreationSummary,
    opportunityCreationSummary,
    taskCreationSummary,
  } = params;
  const formattedMessage = `Bonjour! 🥖 Je m'appelle Kylian Mbaguette. Over the last ${process.env.DAYS_AGO} days:

**🧑‍💻 People & Companies**
${peopleCreationSummary}

**🎯 Opportunities**
${opportunityCreationSummary}

**📋 Tasks**
${taskCreationSummary}`;

  const body = {
    username: 'Twenty Bot',
    content: formattedMessage,
  };

  const response = await fetch(process.env.DISCORD_WEBHOOK_URL ?? '', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return {
    formattedMessage,
    webhookStatus: response.status,
  };
};

export const sendToWhatsApp = async (params: {
  peopleCreationSummary: string;
  opportunityCreationSummary: string;
  taskCreationSummary: string;
}): Promise<object> => {
  const {
    peopleCreationSummary,
    opportunityCreationSummary,
    taskCreationSummary,
  } = params;
  const formattedMessage = `Bonjour! 🥖 Je m'appelle Kylian Mbaguette. Over the last ${process.env.DAYS_AGO} days:

*🧑‍💻 People & Companies*
${peopleCreationSummary}

*🎯 Opportunities*
${opportunityCreationSummary}

*📋 Tasks*
${taskCreationSummary}`;

  const response = await fetch(
    'https://graph.facebook.com/v22.0/828771160324576/messages',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.FB_GRAPH_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: process.env.WHATSAPP_RECIPIENT_PHONE_NUMBER,
        type: 'text',
        text: {
          preview_url: true,
          body: formattedMessage,
        },
      }),
    },
  );

  const responseBody = await response.json();

  return {
    formattedMessage,
    webhookStatus: response.status,
    webhookResponse: responseBody,
  };
};
