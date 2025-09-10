import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { isDefined } from 'twenty-shared/utils';

type TextStepRendererProps = {
  content: string;
};

export const TextStepRenderer = ({ content }: TextStepRendererProps) => {
  if (!isDefined(content)) {
    return null;
  }

  return <LazyMarkdownRenderer text={content} />;
};
