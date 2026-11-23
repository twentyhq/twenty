import { isDefined } from 'twenty-sdk/utils';
import { type SendInteractiveMessageParams } from 'src/logic-functions/types/send-interactive-message-params.type';
import {
  type WhatsAppApiInteractiveList,
  type WhatsAppApiInteractiveReplyButtons,
} from 'src/logic-functions/types/whatsapp-api.type';

export const buildWhatsAppInteractiveContent = ({
  header,
  body,
  footer,
  buttons,
  list,
}: Pick<SendInteractiveMessageParams, 'header' | 'body' | 'footer' | 'buttons' | 'list'>):
  | WhatsAppApiInteractiveReplyButtons
  | WhatsAppApiInteractiveList => {
  const frame = {
    ...(isDefined(header) ? { header: { type: 'text' as const, text: header } } : {}),
    body: { text: body },
    ...(isDefined(footer) ? { footer: { text: footer } } : {}),
  };

  if (isDefined(list)) {
    return {
      ...frame,
      type: 'list',
      action: {
        button: list.buttonText,
        sections: list.sections.map(({ title, rows }, sectionIndex) => {
          const rowOffset = list.sections
            .slice(0, sectionIndex)
            .reduce((total, section) => total + section.rows.length, 0);

          return {
            ...(isDefined(title) ? { title } : {}),
            rows: rows.map(({ id, title: rowTitle, description }, rowIndex) => ({
              id: id ?? `option-${rowOffset + rowIndex + 1}`,
              title: rowTitle,
              ...(isDefined(description) ? { description } : {}),
            })),
          };
        }),
      },
    };
  }

  return {
    ...frame,
    type: 'button',
    action: {
      buttons: (buttons ?? []).map(({ id, title }, index) => ({
        type: 'reply',
        reply: { id: id ?? `option-${index + 1}`, title },
      })),
    },
  };
};
