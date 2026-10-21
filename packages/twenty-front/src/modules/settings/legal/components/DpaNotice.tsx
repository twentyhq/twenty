import { InlineBanner } from 'twenty-ui/components/feedback';

type DpaNoticeProps = {
  text: string;
};

export const DpaNotice = ({ text }: DpaNoticeProps) => (
  <InlineBanner layout="compact" status="warning" fullWidth>
    {text}
  </InlineBanner>
);
