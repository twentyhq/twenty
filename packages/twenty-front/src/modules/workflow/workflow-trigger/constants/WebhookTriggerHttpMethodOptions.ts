import {
  type IconComponent,
  IconHttpGet,
  IconHttpPost,
} from 'twenty-ui/display';
export type WebhookHttpMethods = 'GET' | 'POST';

export const WEBHOOK_TRIGGER_HTTP_METHOD_OPTIONS: Array<{
  label: string;
  value: WebhookHttpMethods;
  Icon: IconComponent;
}> = [
  {
    label: 'GET',
    value: 'GET',
    Icon: IconHttpGet,
  },
  {
    label: 'POST',
    value: 'POST',
    Icon: IconHttpPost,
  },
];
