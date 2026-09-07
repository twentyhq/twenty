import { Callout, type CalloutProps } from 'twenty-ui/feedback';
import { IconAlertTriangle } from 'twenty-ui/icon';

type AiChatCalloutProps = Pick<
  CalloutProps,
  'title' | 'description' | 'action'
>;

export const AiChatCallout = ({
  title,
  description,
  action,
}: AiChatCalloutProps) => (
  <Callout
    fullWidth
    title={title}
    description={description}
    action={action}
    variant="warning"
    Icon={IconAlertTriangle}
  />
);
