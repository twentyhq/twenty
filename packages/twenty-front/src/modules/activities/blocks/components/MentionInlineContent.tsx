import { RecordChip } from '@/object-record/components/RecordChip';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { createReactInlineContentSpec } from '@blocknote/react';
import { ChipSize } from 'twenty-ui/components';

const MentionInlineContentRenderer = ({
  recordId,
  objectNameSingular,
}: {
  recordId: string;
  objectNameSingular: string;
}) => {
  const { record } = useFindOneRecord({
    objectNameSingular,
    objectRecordId: recordId,
  });

  if (!record) {
    return null;
  }

  return (
    <RecordChip
      objectNameSingular={objectNameSingular}
      record={record}
      size={ChipSize.Small}
      forceDisableClick={false}
    />
  );
};

export const MentionInlineContent = createReactInlineContentSpec(
  {
    type: 'mention' as const,
    propSchema: {
      recordId: {
        default: '' as const,
      },
      objectNameSingular: {
        default: '' as const,
      },
    },
    content: 'none',
  },
  {
    render: (props) => {
      const { recordId, objectNameSingular } = props.inlineContent.props;

      return (
        <MentionInlineContentRenderer
          recordId={recordId}
          objectNameSingular={objectNameSingular}
        />
      );
    },
  },
);
