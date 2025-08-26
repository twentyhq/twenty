import { EllipsisDisplay } from 'twenty-ui/display';

type JsonDisplayProps = {
  text: string;
  maxWidth?: number;
};

export const JsonDisplay = ({ text, maxWidth }: JsonDisplayProps) => (
  <EllipsisDisplay maxWidth={maxWidth}>{text}</EllipsisDisplay>
);
