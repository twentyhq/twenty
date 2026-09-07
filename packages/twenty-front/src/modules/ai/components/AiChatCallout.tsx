import { styled } from '@linaria/react';
import { Callout, type CalloutProps } from 'twenty-ui/feedback';
import { IconAlertTriangle } from 'twenty-ui/icon';

const StyledCallout = styled(Callout)`
  max-width: none;
`;

type AiChatCalloutProps = Pick<
  CalloutProps,
  'title' | 'description' | 'action'
>;

export const AiChatCallout = ({
  title,
  description,
  action,
}: AiChatCalloutProps) => (
  <StyledCallout
    title={title}
    description={description}
    action={action}
    variant="warning"
    Icon={IconAlertTriangle}
  />
);
