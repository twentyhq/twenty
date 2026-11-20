import { type SendAppMessageAttachment } from 'twenty-sdk/logic-function';
import { whatsAppApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';

export const uploadWhatsAppMedia = async ({
  accessToken,
  phoneNumberId,
  attachment,
}: {
  accessToken: string;
  phoneNumberId: string;
  attachment: SendAppMessageAttachment;
}): Promise<string> => {
  const response = await fetch(attachment.downloadUrl);

  if (!response.ok) {
    throw new Error(`Downloading attachment ${attachment.filename} failed (${response.status})`);
  }

  const formData = new FormData();

  formData.append('messaging_product', 'whatsapp');
  formData.append('type', attachment.contentType);
  formData.append(
    'file',
    new Blob([await response.arrayBuffer()], { type: attachment.contentType }),
    attachment.filename,
  );

  const { id } = await whatsAppApiRequest({
    accessToken,
    endpoint: 'POST /{phoneNumberId}/media',
    pathParams: { phoneNumberId },
    data: formData,
  });

  return id;
};
