import axios from 'axios';
import { whatsappApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';

export const downloadWhatsAppFile = async ({
  accessToken,
  mediaId,
}: {
  accessToken: string;
  mediaId: string;
}) => {
  const { url, mime_type } = await whatsappApiRequest({
    accessToken,
    endpoint: 'GET /{mediaId}',
    pathParams: { mediaId },
  });

  const { data } = await axios.get<ArrayBuffer>(url, {
    responseType: 'arraybuffer',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return { fileBuffer: Buffer.from(data), mimeType: mime_type };
};
