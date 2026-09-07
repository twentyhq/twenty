import {
  getFirstNonEmptyLineOfRichTextSegments,
  getRichTextPreviewSegmentStyle,
} from '@/blocknote-editor/utils/getFirstNonEmptyLineOfRichTextSegments';
import { parseInitialBlocknote } from '@/blocknote-editor/utils/parseInitialBlocknote';
import { useRichTextFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useRichTextFieldDisplay';

export const RichTextFieldDisplay = () => {
  const { fieldValue } = useRichTextFieldDisplay();

  const blocks = parseInitialBlocknote(fieldValue?.blocknote) ?? null;
  const segments = getFirstNonEmptyLineOfRichTextSegments(blocks);

  return (
    <div>
      {segments.map((segment, index) => (
        <span
          key={index}
          style={getRichTextPreviewSegmentStyle(segment.styles)}
        >
          {segment.text}
        </span>
      ))}
    </div>
  );
};
