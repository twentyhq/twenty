import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { RecordDetailSectionContainer } from '@/object-record/record-field-list/record-detail-section/components/RecordDetailSectionContainer';
import { RecordDetailRelationRecordsList } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationRecordsList';
import { RecordDetailRelationSectionDropdown } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationSectionDropdown';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import {
  FieldInputEventContext,
  type FieldInputEvent,
} from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { usePersistField } from '@/object-record/record-field/ui/hooks/usePersistField';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getRecordFieldCardRelationPickerDropdownId } from '@/object-record/record-show/utils/getRecordFieldCardRelationPickerDropdownId';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { coreIndexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreIndexViewIdFromObjectMetadataItemFamilySelector';
import { useLingui } from '@lingui/react/macro';
import {
  AppPath,
  ViewFilterOperand,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

type RecordDetailRelationSectionProps = {
  loading: boolean;
};

export const RecordDetailRelationSection = ({
  loading,
}: RecordDetailRelationSectionProps) => {
  const { t } = useLingui();

  const { recordId, fieldDefinition } = useContext(FieldContext);

  const {
    fieldName,
    relationFieldMetadataId,
    relationObjectMetadataNameSingular,
    relationType,
    objectMetadataNameSingular,
  } = fieldDefinition.metadata as FieldRelationMetadata;

  const isMobile = useIsMobile();
  const { objectMetadataItem: relationObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: relationObjectMetadataNameSingular,
    });

  const relationFieldMetadataItem = relationObjectMetadataItem.fields.find(
    ({ id }) => id === relationFieldMetadataId,
  );

  const fieldValue = useRecoilValue<
    ({ id: string } & Record<string, any>) | ObjectRecord[] | null
  >(recordStoreFamilySelector({ recordId, fieldName }));

  // TODO: use new relation type
  const isToOneObject = relationType === RelationType.MANY_TO_ONE;
  const isToManyObjects = relationType === RelationType.ONE_TO_MANY;

  const relationRecords: ObjectRecord[] =
    fieldValue && isToOneObject
      ? [fieldValue as ObjectRecord]
      : ((fieldValue as ObjectRecord[]) ?? []);

  const dropdownId = getRecordFieldCardRelationPickerDropdownId({
    fieldDefinition,
    recordId,
  });

  const isDropdownOpen = useRecoilComponentValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  const indexViewId = useRecoilValue(
    coreIndexViewIdFromObjectMetadataItemFamilySelector({
      objectMetadataItemId: relationObjectMetadataItem.id,
    }),
  );

  const filterQueryParams = {
    filter: {
      [relationFieldMetadataItem?.name || '']: {
        [ViewFilterOperand.Is]: {
          selectedRecordIds: [recordId],
        },
      },
    },
    viewId: indexViewId,
  };

  const filterLinkHref = getAppPath(
    AppPath.RecordIndexPage,
    {
      objectNamePlural: relationObjectMetadataItem.namePlural,
    },
    filterQueryParams,
  );

  const filtersForAggregate = isToManyObjects
    ? ({
        [`${relationFieldMetadataItem?.name}Id`]: {
          in: [recordId],
        },
      } satisfies RecordGqlOperationFilter)
    : {};

  const { data: relationAggregateResult } = useAggregateRecords<{
    id: { COUNT: number };
  }>({
    objectNameSingular: relationObjectMetadataItem.nameSingular,
    filter: filtersForAggregate,
    skip: !isToManyObjects,
    recordGqlFieldsAggregate: {
      id: [AggregateOperations.COUNT],
    },
  });

  // TODO: refactor this when we have refactored columnDefinitions and field definitions because
  //    we should be able to get the objectMetadataItem from a context way more easily
  const { objectMetadataItems } = useObjectMetadataItems();

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItemToFind) =>
      objectMetadataItemToFind.nameSingular === objectMetadataNameSingular,
  );

  const persistField = usePersistField({
    objectMetadataItemId: objectMetadataItem?.id ?? '',
  });

  const handleSubmit: FieldInputEvent = ({ newValue }) => {
    persistField({
      recordId: recordId,
      fieldDefinition,
      valueToPersist: newValue,
    });
  };

  if (loading) return null;

  const relationRecordsCount = relationAggregateResult?.id?.COUNT ?? 0;

  return (
    <FieldInputEventContext.Provider
      value={{
        onSubmit: handleSubmit,
      }}
    >
      <RecordDetailSectionContainer
        title={fieldDefinition.label}
        link={
          isToManyObjects
            ? {
                to: filterLinkHref,
                label:
                  relationRecordsCount > 0
                    ? t`All (${relationRecordsCount})`
                    : '',
              }
            : undefined
        }
        hideRightAdornmentOnMouseLeave={!isDropdownOpen && !isMobile}
        areRecordsAvailable={relationRecords.length > 0}
        rightAdornment={
          <RecordDetailRelationSectionDropdown loading={loading} />
        }
      >
        {relationRecords.length > 0 && (
          <RecordDetailRelationRecordsList relationRecords={relationRecords} />
        )}
      </RecordDetailSectionContainer>
    </FieldInputEventContext.Provider>
  );
};
