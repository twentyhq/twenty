import { OverflowingTextWithTooltip } from '../../../display/tooltip/OverflowingTextWithTooltip';
import { EllipsisDisplay } from './EllipsisDisplay';

type TextDisplayProps = {
  text: string;
};

export const TextDisplay = ({ text }: TextDisplayProps) => (
  <EllipsisDisplay>
    <OverflowingTextWithTooltip text={text} />
  </EllipsisDisplay>
);
