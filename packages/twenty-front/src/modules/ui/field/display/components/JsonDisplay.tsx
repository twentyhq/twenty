import { OverflowingTextWithTooltip } from '../../../display/tooltip/OverflowingTextWithTooltip';

import { EllipsisDisplay } from './EllipsisDisplay';

type JsonDisplayProps = {
  text: string;
  maxWidth?: number;
};

export const JsonDisplay = ({ text, maxWidth }: JsonDisplayProps) => (
  <EllipsisDisplay maxWidth={maxWidth}>
    <OverflowingTextWithTooltip text={text} mutliline />
  </EllipsisDisplay>
);
