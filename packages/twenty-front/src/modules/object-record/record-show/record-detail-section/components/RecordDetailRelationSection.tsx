import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordGqlOperationFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsFieldValueReadOnly } from '@/object-record/record-field/hooks/useIsFieldValueReadOnly';
import { useIsRecordReadOnly } from '@/object-record/record-field/hooks/useIsRecordReadOnly';
import { FieldRelationMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordDetailRelationRecordsList } from '@/object-record/record-show/record-detail-section/components/RecordDetailRelationRecordsList';
import { RecordDetailRelationSectionDropdown } from '@/object-record/record-show/record-detail-section/components/RecordDetailRelationSectionDropdown';
import { RecordDetailSection } from '@/object-record/record-show/record-detail-section/components/RecordDetailSection';
import { RecordDetailSectionHeader } from '@/object-record/record-show/record-detail-section/components/RecordDetailSectionHeader';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { prefetchIndexViewIdFromObjectMetadataItemFamilySelector } from '@/prefetch/states/selector/prefetchIndexViewIdFromObjectMetadataItemFamilySelector';
import { AppPath } from '@/types/AppPath';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { useLingui } from '@lingui/react/macro';
import { RelationDefinitionType } from '~/generated-metadata/graphql';
import { getAppPath } from '~/utils/navigation/getAppPath';

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
  const isToOneObject = relationType === RelationDefinitionType.MANY_TO_ONE;
  const isToManyObjects = relationType === RelationDefinitionType.ONE_TO_MANY;

  const relationRecords: ObjectRecord[] =
    fieldValue && isToOneObject
      ? [fieldValue as ObjectRecord]
      : ((fieldValue as ObjectRecord[]) ?? []);

  const dropdownId = `record-field-card-relation-picker-${fieldDefinition.fieldMetadataId}-${recordId}`;

  const { isDropdownOpen } = useDropdown(dropdownId);

  const indexViewId = useRecoilValue(
    prefetchIndexViewIdFromObjectMetadataItemFamilySelector({
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
    view: indexViewId,
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
      id: [AGGREGATE_OPERATIONS.count],
    },
  });

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId,
  });

  const isFieldReadOnly = useIsFieldValueReadOnly({
    fieldDefinition,
    isRecordReadOnly,
  });

  if (loading || isFieldReadOnly) return null;

  const relationRecordsCount = relationAggregateResult?.id?.COUNT ?? 0;

  return (
    <RecordDetailSection>
      <RecordDetailSectionHeader
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
      />
      {relationRecords.length > 0 && (
        <RecordDetailRelationRecordsList relationRecords={relationRecords} />
      )}
    </RecordDetailSection>
  );
};
