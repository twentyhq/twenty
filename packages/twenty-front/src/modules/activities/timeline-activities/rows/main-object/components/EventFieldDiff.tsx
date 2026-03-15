import { styled } from '@linaria/react';

import { EventFieldDiffLabel } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffLabel';
import { EventFieldDiffValue } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffValue';
import { EventFieldDiffValueEffect } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffValueEffect';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { Trans } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type EventFieldDiffProps = {
  diffRecord: Record<string, any>;
  diffBeforeRecord?: Record<string, any>;
  mainObjectMetadataItem: ObjectMetadataItem;
  fieldMetadataItem: FieldMetadataItem | undefined;
  diffArtificialRecordStoreId: string;
};

const StyledEventFieldDiffContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
  height: 24px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledEmptyValue = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledBeforeValue = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  text-decoration: line-through;

  * {
    color: inherit;
  }
`;

export const EventFieldDiff = ({
  diffRecord,
  diffBeforeRecord,
  mainObjectMetadataItem,
  fieldMetadataItem,
  diffArtificialRecordStoreId,
}: EventFieldDiffProps) => {
  if (!fieldMetadataItem) {
    throw new Error('fieldMetadataItem is required');
  }

  const isValueEmpty = (value: unknown): boolean =>
    value === null || value === undefined || value === '';

  const isObjectEmpty = (obj: Record<string, unknown>): boolean =>
    Object.values(obj).every(isValueEmpty);

  const isUpdatedToEmpty =
    isValueEmpty(diffRecord) ||
    (typeof diffRecord === 'object' &&
      diffRecord !== null &&
      isObjectEmpty(diffRecord));

  const isBeforeEmpty =
    diffBeforeRecord === undefined ||
    isValueEmpty(diffBeforeRecord) ||
    (typeof diffBeforeRecord === 'object' &&
      diffBeforeRecord !== null &&
      isObjectEmpty(diffBeforeRecord));

  const diffBeforeArtificialRecordStoreId =
    diffArtificialRecordStoreId + '--before';

  return (
    <StyledEventFieldDiffContainer>
      <EventFieldDiffLabel fieldMetadataItem={fieldMetadataItem} />
      {!isBeforeEmpty && (
        <StyledBeforeValue>
          <EventFieldDiffValueEffect
            diffArtificialRecordStoreId={diffBeforeArtificialRecordStoreId}
            mainObjectMetadataItem={mainObjectMetadataItem}
            fieldMetadataItem={fieldMetadataItem}
            diffRecord={diffBeforeRecord}
          />
          <EventFieldDiffValue
            diffArtificialRecordStoreId={diffBeforeArtificialRecordStoreId}
            mainObjectMetadataItem={mainObjectMetadataItem}
            fieldMetadataItem={fieldMetadataItem}
          />
        </StyledBeforeValue>
      )}
      →
      {isUpdatedToEmpty ? (
        <StyledEmptyValue>
          <Trans>Empty</Trans>
        </StyledEmptyValue>
      ) : (
        <>
          <EventFieldDiffValueEffect
            diffArtificialRecordStoreId={diffArtificialRecordStoreId}
            mainObjectMetadataItem={mainObjectMetadataItem}
            fieldMetadataItem={fieldMetadataItem}
            diffRecord={diffRecord}
          />
          <EventFieldDiffValue
            diffArtificialRecordStoreId={diffArtificialRecordStoreId}
            mainObjectMetadataItem={mainObjectMetadataItem}
            fieldMetadataItem={fieldMetadataItem}
          />
        </>
      )}
    </StyledEventFieldDiffContainer>
  );
};
