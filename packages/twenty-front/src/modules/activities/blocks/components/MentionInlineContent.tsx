import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { createReactInlineContentSpec } from '@blocknote/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Chip, ChipVariant } from 'twenty-ui/components';

const StyledRecordChip = styled(RecordChip)`
  height: auto;
  margin: 0;
  padding: ${({ theme }) => `0 ${theme.spacing(1)}`};
`;

const MentionInlineContentRenderer = ({
  recordId,
  objectMetadataId,
}: {
  recordId: string;
  objectMetadataId: string;
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === objectMetadataId,
  );

  const objectNameSingular = objectMetadataItem?.nameSingular;

  const { record, loading } = useFindOneRecord({
    objectNameSingular: objectNameSingular ?? '',
    objectRecordId: recordId,
    skip: !isNonEmptyString(objectNameSingular) || !isNonEmptyString(recordId),
  });

  if (loading) {
    return null;
  }

  if (!isDefined(objectMetadataItem)) {
    return (
      <Chip
        label={t`Unknown object`}
        variant={ChipVariant.Transparent}
        disabled
      />
    );
  }

  if (!isDefined(record)) {
    return (
      <Chip
        label={t`Deleted record`}
        variant={ChipVariant.Transparent}
        disabled
      />
    );
  }

  return (
    <StyledRecordChip
      objectNameSingular={objectMetadataItem.nameSingular}
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
      objectMetadataId: {
        default: '' as const,
      },
    },
    content: 'none',
  },
  {
    render: (props) => {
      const { recordId, objectMetadataId } = props.inlineContent.props;

      return (
        <MentionInlineContentRenderer
          recordId={recordId}
          objectMetadataId={objectMetadataId}
        />
      );
    },
  },
);
