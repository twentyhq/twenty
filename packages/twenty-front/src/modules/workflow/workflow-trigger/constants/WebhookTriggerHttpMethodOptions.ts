import { IconComponent, IconHttpPost, IconHttpGet } from 'twenty-ui/display';
export type WebhookHttpMethods = 'GET' | 'POST';

export const WEBHOOK_TRIGGER_HTTP_METHOD_OPTIONS: Array<{
  label: string;
  value: WebhookHttpMethods;
  Icon: IconComponent;
}> = [
  {
    label: 'Get',
    value: 'GET',
    Icon: IconHttpGet,
  },
  {
    label: 'Post',
    value: 'POST',
    Icon: IconHttpPost,
  },
];
