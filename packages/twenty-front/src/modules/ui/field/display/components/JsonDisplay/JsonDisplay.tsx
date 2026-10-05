import { EllipsisDisplay } from '@/ui/field/display/components/internal/EllipsisDisplay/EllipsisDisplay';

type JsonDisplayProps = {
  text: string;
  maxWidth?: number;
};

export const JsonDisplay = ({ text, maxWidth }: JsonDisplayProps) => (
  <EllipsisDisplay maxWidth={maxWidth}>{text}</EllipsisDisplay>
);
