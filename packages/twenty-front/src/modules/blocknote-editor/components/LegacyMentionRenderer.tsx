import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Chip, ChipVariant } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledRecordChipContainer = styled.div`
  display: inline;
  height: auto;
  margin: 0;
  padding: 0 ${themeCssVariables.spacing[1]};
`;

type LegacyMentionRendererProps = {
  recordId: string;
  objectMetadataId: string;
};

export const LegacyMentionRenderer = ({
  recordId,
  objectMetadataId,
}: LegacyMentionRendererProps) => {
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
