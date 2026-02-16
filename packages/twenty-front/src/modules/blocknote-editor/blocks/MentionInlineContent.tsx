import { MentionRecordChip } from '@/mention/components/MentionRecordChip';
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

const StyledInlineMentionRecordChip = styled(MentionRecordChip)`
  height: auto;
  margin: 0;
  padding: ${({ theme }) => `0 ${theme.spacing(1)}`};
`;

// Backward-compatible renderer for legacy notes that only stored objectMetadataId + recordId
const LegacyMentionRenderer = ({
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
      objectNameSingular: {
        default: '' as const,
      },
      label: {
        default: '' as const,
      },
      imageUrl: {
        default: '' as const,
      },
    },
    content: 'none',
  },
  {
    render: (props) => {
      const {
        recordId,
        objectMetadataId,
        objectNameSingular,
        label,
        imageUrl,
      } = props.inlineContent.props;

      // New notes store objectNameSingular + label + imageUrl directly
      if (isNonEmptyString(objectNameSingular) && isNonEmptyString(label)) {
        return (
          <StyledInlineMentionRecordChip
            recordId={recordId}
            objectNameSingular={objectNameSingular}
            label={label}
            imageUrl={imageUrl}
          />
        );
      }

      // Legacy notes only have objectMetadataId + recordId: fetch data
      return (
        <LegacyMentionRenderer
          recordId={recordId}
          objectMetadataId={objectMetadataId}
        />
      );
    },
  },
);
