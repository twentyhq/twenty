import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { ChipVariant } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type EventFieldDiffRelationValueProps = {
  diffRecord: unknown;
  fieldMetadataItem: FieldMetadataItem;
};

const StyledEmptyValue = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

export const EventFieldDiffRelationValue = ({
  diffRecord,
  fieldMetadataItem,
}: EventFieldDiffRelationValueProps) => {
  const relationObjectNameSingular =
    fieldMetadataItem.relation?.targetObjectMetadata.nameSingular ?? '';

  const isValidId =
    typeof diffRecord === 'string' && diffRecord.length > 0;

  const { record, loading } = useFindOneRecord({
    objectNameSingular: relationObjectNameSingular,
    objectRecordId: isValidId ? diffRecord : undefined,
    skip: !relationObjectNameSingular || !isValidId,
  });

  if (!diffRecord) {
    return (
      <StyledEmptyValue>
        <Trans>Empty</Trans>
      </StyledEmptyValue>
    );
  }

  if (loading || !record) {
    return null;
  }

  return (
    <RecordChip
      objectNameSingular={relationObjectNameSingular}
      record={record}
      variant={ChipVariant.Transparent}
      forceDisableClick
    />
  );
};
