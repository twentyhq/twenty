import { BaseEmail } from 'src/components/BaseEmail';
import { Title } from 'src/components/Title';
import { MainText } from 'src/components/MainText';
import { CallToAction } from 'src/components/CallToAction';

type WorkflowActionEmailProps = {
  mainText?: string;
  title?: string;
  callToAction?: {
    value: string;
    href: string;
  };
};
export const WorkflowActionEmail = ({
  mainText,
  title,
  callToAction,
}: WorkflowActionEmailProps) => {
  return (
    <BaseEmail withLogo={false}>
      {title && <Title value={title} />}
      {mainText && <MainText>{mainText}</MainText>}
      {callToAction && (
        <CallToAction value={callToAction.value} href={callToAction.href} />
      )}
    </BaseEmail>
  );
};
