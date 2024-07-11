import { AvatarChip, AvatarChipVariant } from 'twenty-ui';

import { PreComputedChipGeneratorsContext } from '@/object-metadata/context/PreComputedChipGeneratorsContext';
import { generateDefaultRecordChipData } from '@/object-metadata/utils/generateDefaultRecordChipData';
import { RecordIndexEventContext } from '@/object-record/record-index/contexts/RecordIndexEventContext';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { MouseEvent, useContext } from 'react';

export type RecordIndexRecordChipProps = {
  objectNameSingular: string;
  record: ObjectRecord;
  variant?: AvatarChipVariant;
};

export const RecordIndexRecordChip = ({
  objectNameSingular,
  record,
  variant,
}: RecordIndexRecordChipProps) => {
  const { onIdentifierChipClick } = useContext(RecordIndexEventContext);

  const { identifierChipGeneratorPerObject } = useContext(
    PreComputedChipGeneratorsContext,
  );

  const generateRecordChipData =
    identifierChipGeneratorPerObject[objectNameSingular] ??
    generateDefaultRecordChipData;

  const recordChipData = generateRecordChipData(record);

  const handleAvatarChipClick = (event: MouseEvent) => {
    event.preventDefault();
    onIdentifierChipClick(record.id);
  };

  return (
    <AvatarChip
      placeholderColorSeed={record.id}
      name={recordChipData.name}
      avatarType={recordChipData.avatarType}
      avatarUrl={recordChipData.avatarUrl ?? ''}
      onClick={handleAvatarChipClick}
      variant={variant}
    />
  );
};
