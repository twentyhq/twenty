import { BaseEmail } from 'src/components/BaseEmail';
import { Title } from 'src/components/Title';
import { CallToAction } from 'src/components/CallToAction';

type WorkflowActionEmailProps = {
  dangerousHTML?: string;
  title?: string;
  callToAction?: {
    value: string;
    href: string;
  };
};
export const WorkflowActionEmail = ({
  dangerousHTML,
  title,
  callToAction,
}: WorkflowActionEmailProps) => {
  return (
    <BaseEmail>
      {title && <Title value={title} />}
      {dangerousHTML && (
        <div dangerouslySetInnerHTML={{ __html: dangerousHTML }} />
      )}
      {callToAction && (
        <CallToAction value={callToAction.value} href={callToAction.href} />
      )}
    </BaseEmail>
  );
};
