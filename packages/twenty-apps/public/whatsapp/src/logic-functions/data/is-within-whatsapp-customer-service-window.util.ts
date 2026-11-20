import { WHATSAPP_CUSTOMER_SERVICE_WINDOW_MS } from 'src/constants/whatsapp-customer-service-window-ms.constant';

export const isWithinWhatsAppCustomerServiceWindow = ({
  lastCustomerMessageAt,
  now = new Date(),
}: {
  lastCustomerMessageAt: Date | undefined;
  now?: Date;
}): boolean =>
  lastCustomerMessageAt !== undefined &&
  now.getTime() - lastCustomerMessageAt.getTime() <= WHATSAPP_CUSTOMER_SERVICE_WINDOW_MS;
