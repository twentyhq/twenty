import { z } from 'zod';

// limits from https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/interactive-reply-buttons-messages
// and https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/interactive-list-messages
const buttonSchema = z.object({
  id: z.string().min(1).max(256).optional(),
  title: z.string().min(1).max(20),
});

const listSchema = z.object({
  buttonText: z.string().min(1).max(20),
  sections: z
    .array(
      z.object({
        title: z.string().min(1).max(24).optional(),
        rows: z
          .array(
            z.object({
              id: z.string().min(1).max(200).optional(),
              title: z.string().min(1).max(24),
              description: z.string().min(1).max(72).optional(),
            }),
          )
          .min(1),
      }),
    )
    .min(1)
    .max(10)
    .refine((sections) => sections.reduce((count, { rows }) => count + rows.length, 0) <= 10, {
      message: 'A list holds at most 10 rows in total',
    }),
});

export const sendInteractiveMessageParamsSchema = z
  .object({
    whatsAppBusinessAccountId: z.string().min(1).optional(),
    phoneNumberId: z.string().min(1).optional(),
    to: z.string().min(1),
    header: z.string().min(1).max(60).optional(),
    body: z.string().min(1).max(1024),
    footer: z.string().min(1).max(60).optional(),
    buttons: z.array(buttonSchema).min(1).max(3).optional(),
    list: listSchema.optional(),
  })
  .refine(({ buttons, list }) => (buttons === undefined) !== (list === undefined), {
    message: 'Pass either buttons or a list',
    path: ['buttons'],
  });
