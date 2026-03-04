// Lambda: Forward RDS SNS events to Slack
// Environment variable: SLACK_WEBHOOK_URL

export const handler = async (event) => {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('SLACK_WEBHOOK_URL not set');
    return { statusCode: 500, body: 'Missing webhook URL' };
  }

  for (const record of event.Records) {
    const message = JSON.parse(record.Sns.Message);
    const source = message['Source ID'] || message.SourceIdentifier || 'unknown';
    const eventMessage = message['Event Message'] || message.Message || JSON.stringify(message);
    const eventId = message['Event ID'] || '';
    const timestamp = record.Sns.Timestamp;

    const severity = getSeverity(eventMessage);

    const slackPayload = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${severity.emoji} RDS Alert: ${source}`,
          },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Source:*\n${source}` },
            { type: 'mrkdwn', text: `*Time:*\n${timestamp}` },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Event:*\n${eventMessage}`,
          },
        },
      ],
    };

    if (eventId) {
      slackPayload.blocks.push({
        type: 'context',
        elements: [{ type: 'mrkdwn', text: `Event ID: ${eventId}` }],
      });
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackPayload),
    });

    if (!response.ok) {
      console.error(`Slack webhook failed: ${response.status} ${await response.text()}`);
    }
  }

  return { statusCode: 200, body: 'OK' };
};

function getSeverity(message) {
  const lower = message.toLowerCase();
  if (lower.includes('failover') || lower.includes('failure')) {
    return { emoji: '\u{1F6A8}' };
  }
  if (lower.includes('maintenance')) {
    return { emoji: '\u{1F527}' };
  }
  if (lower.includes('configuration')) {
    return { emoji: '\u2699\uFE0F' };
  }
  return { emoji: '\u2139\uFE0F' };
}
