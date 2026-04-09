import { MentionRecordChip } from '@/mention/components/MentionRecordChip';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { createReactInlineContentSpec } from '@blocknote/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Chip, ChipVariant } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledRecordChipContainer = styled.div`
  display: inline;
  height: auto;
  margin: 0;
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const StyledInlineMentionRecordChipContainer = styled.div`
  display: inline;
  height: auto;
  margin: 0;
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const LegacyMentionRenderer = ({
  recordId,
  objectMetadataId,
}: {
  recordId: string;
  objectMetadataId: string;
}) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

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
    <StyledRecordChipContainer>
      <RecordChip
        objectNameSingular={objectMetadataItem.nameSingular}
        record={record}
        forceDisableClick={false}
      />
    </StyledRecordChipContainer>
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
          <StyledInlineMentionRecordChipContainer>
            <MentionRecordChip
              recordId={recordId}
              objectNameSingular={objectNameSingular}
              label={label}
              imageUrl={imageUrl}
            />
          </StyledInlineMentionRecordChipContainer>
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
