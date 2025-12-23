import { RecordChip } from '@/object-record/components/RecordChip';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { createReactInlineContentSpec } from '@blocknote/react';
import styled from '@emotion/styled';

const StyledRecordChip = styled(RecordChip)`
  height: auto;
  margin: 0;
  padding: ${({ theme }) => `0 ${theme.spacing(1)}`};
`;

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
    skip: !objectNameSingular || !recordId,
  });

  if (!record || !objectNameSingular) {
    return <span>@mention</span>;
  }

  return (
    <StyledRecordChip
      objectNameSingular={objectNameSingular}
      record={record}
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
