import { isNonEmptyString } from '@sniptt/guards';
import { type SendInteractiveMessageParams } from 'src/logic-functions/types/send-interactive-message-params.type';

// the text stored in Twenty: the message followed by the options offered to the customer
export const formatWhatsAppInteractiveText = ({
  header,
  body,
  footer,
  buttons,
  list,
}: Pick<SendInteractiveMessageParams, 'header' | 'body' | 'footer' | 'buttons' | 'list'>): string => {
  const options = [
    ...(buttons ?? []).map(({ title }) => title),
    ...(list?.sections ?? []).flatMap(({ rows }) =>
      rows.map(({ title, description }) => [title, description].filter(isNonEmptyString).join(' - ')),
    ),
  ];

  return [header, body, options.map((option) => `• ${option}`).join('\n'), footer]
    .filter(isNonEmptyString)
    .join('\n\n');
};
