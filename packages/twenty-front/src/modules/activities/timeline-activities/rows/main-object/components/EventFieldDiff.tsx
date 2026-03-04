import styled from '@emotion/styled';

import { EventFieldDiffLabel } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffLabel';
import { EventFieldDiffValue } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffValue';
import { EventFieldDiffValueEffect } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffValueEffect';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { Trans } from '@lingui/react/macro';

type EventFieldDiffProps = {
  diffRecord: Record<string, any>;
  diffBeforeRecord?: Record<string, any>;
  mainObjectMetadataItem: ObjectMetadataItem;
  fieldMetadataItem: FieldMetadataItem | undefined;
  diffArtificialRecordStoreId: string;
  diffBeforeArtificialRecordStoreId?: string;
};

const StyledEventFieldDiffContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 24px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledEmptyValue = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledBeforeValue = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  text-decoration: line-through;
`;

const StyledArrow = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  flex-shrink: 0;
`;

export const EventFieldDiff = ({
  diffRecord,
  diffBeforeRecord,
  mainObjectMetadataItem,
  fieldMetadataItem,
  diffArtificialRecordStoreId,
  diffBeforeArtificialRecordStoreId,
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
    !diffBeforeRecord ||
    isValueEmpty(diffBeforeRecord) ||
    (typeof diffBeforeRecord === 'object' &&
      diffBeforeRecord !== null &&
      isObjectEmpty(diffBeforeRecord));

  const showBeforeValue = !isBeforeEmpty && !!diffBeforeArtificialRecordStoreId;

  return (
    <StyledEventFieldDiffContainer>
      <EventFieldDiffLabel fieldMetadataItem={fieldMetadataItem} />
      {showBeforeValue && (
        <>
          <StyledBeforeValue>
            <EventFieldDiffValueEffect
              diffArtificialRecordStoreId={
                diffBeforeArtificialRecordStoreId as string
              }
              mainObjectMetadataItem={mainObjectMetadataItem}
              fieldMetadataItem={fieldMetadataItem}
              diffRecord={diffBeforeRecord as Record<string, any>}
            />
            <EventFieldDiffValue
              diffArtificialRecordStoreId={
                diffBeforeArtificialRecordStoreId as string
              }
              mainObjectMetadataItem={mainObjectMetadataItem}
              fieldMetadataItem={fieldMetadataItem}
            />
          </StyledBeforeValue>
          <StyledArrow>→</StyledArrow>
        </>
      )}
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
