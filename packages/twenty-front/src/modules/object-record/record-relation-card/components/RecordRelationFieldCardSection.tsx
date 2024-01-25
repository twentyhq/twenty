import { useCallback, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Reference } from '@apollo/client';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import qs from 'qs';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { parseFieldRelationType } from '@/object-metadata/utils/parseFieldRelationType';
import { FieldContext } from '@/object-record/field/contexts/FieldContext';
import { usePersistField } from '@/object-record/field/hooks/usePersistField';
import { entityFieldsFamilyState } from '@/object-record/field/states/entityFieldsFamilyState';
import { entityFieldsFamilySelector } from '@/object-record/field/states/selectors/entityFieldsFamilySelector';
import { FieldRelationMetadata } from '@/object-record/field/types/FieldMetadata';
import { useModifyRecordFromCache } from '@/object-record/hooks/useModifyRecordFromCache';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RecordRelationFieldCardContent } from '@/object-record/record-relation-card/components/RecordRelationFieldCardContent';
import { SingleEntitySelectMenuItemsWithSearch } from '@/object-record/relation-picker/components/SingleEntitySelectMenuItemsWithSearch';
import { useRelationPicker } from '@/object-record/relation-picker/hooks/useRelationPicker';
import { RelationPickerScope } from '@/object-record/relation-picker/scopes/RelationPickerScope';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { IconForbid, IconPlus } from '@/ui/display/icon';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Card } from '@/ui/layout/card/components/Card';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { Section } from '@/ui/layout/section/components/Section';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { FilterQueryParams } from '@/views/hooks/internal/useFiltersFromQueryParams';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

const StyledAddDropdown = styled(Dropdown)`
  margin-left: auto;
`;

const StyledHeader = styled.header<{ isDropdownOpen?: boolean }>`
  align-items: center;
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  padding: ${() => (useIsMobile() ? '0 12px' : 'unset')};

  ${({ isDropdownOpen, theme }) =>
    isDropdownOpen
      ? ''
      : css`
          .displayOnHover {
            opacity: 0;
            pointer-events: none;
            transition: opacity ${theme.animation.duration.instant}s ease;
          }
        `}

  &:hover {
    .displayOnHover {
      opacity: 1;
      pointer-events: auto;
    }
  }
`;

const StyledTitle = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledTitleLabel = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.font.color.light};
  text-decoration: none;
  font-size: ${({ theme }) => theme.font.size.sm};

  :hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

export const RecordRelationFieldCardSection = () => {
  const { entityId, fieldDefinition } = useContext(FieldContext);
  const {
    fieldName,
    relationFieldMetadataId,
    relationObjectMetadataNameSingular,
    relationType,
    objectMetadataNameSingular,
  } = fieldDefinition.metadata as FieldRelationMetadata;
  const record = useRecoilValue(entityFieldsFamilyState(entityId));

  const {
    labelIdentifierFieldMetadata: relationLabelIdentifierFieldMetadata,
    objectMetadataItem: relationObjectMetadataItem,
  } = useObjectMetadataItem({
    objectNameSingular: relationObjectMetadataNameSingular,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: objectMetadataNameSingular ?? '',
  });

  const relationFieldMetadataItem = relationObjectMetadataItem.fields.find(
    ({ id }) => id === relationFieldMetadataId,
  );

  const fieldValue = useRecoilValue<
    ({ id: string } & Record<string, any>) | null
  >(entityFieldsFamilySelector({ entityId, fieldName }));

  const isToOneObject = relationType === 'TO_ONE_OBJECT';

  const relationRecords: ObjectRecord[] =
    fieldValue && isToOneObject
      ? [fieldValue]
      : fieldValue?.edges.map(({ node }: { node: ObjectRecord }) => node) ?? [];
  const relationRecordIds = relationRecords.map(({ id }) => id);

  const dropdownId = `record-field-card-relation-picker-${fieldDefinition.label}`;

  const { closeDropdown, isDropdownOpen } = useDropdown(dropdownId);

  const { relationPickerSearchFilter, setRelationPickerSearchFilter } =
    useRelationPicker({ relationPickerScopeId: dropdownId });

  const { searchQuery } = useRelationPicker();

  const entities = useFilteredSearchEntityQuery({
    filters: [
      {
        fieldNames:
          searchQuery?.computeFilterFields?.(
            relationObjectMetadataNameSingular,
          ) ?? [],
        filter: relationPickerSearchFilter,
      },
    ],
    orderByField: 'createdAt',
    selectedIds: relationRecordIds,
    objectNameSingular: relationObjectMetadataNameSingular,
  });

  const handleCloseRelationPickerDropdown = useCallback(() => {
    setRelationPickerSearchFilter('');
  }, [setRelationPickerSearchFilter]);

  const persistField = usePersistField();
  const { updateOneRecord: updateOneRelationRecord } = useUpdateOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
  });

  const modifyRecordFromCache = useModifyRecordFromCache({
    objectMetadataItem,
  });

  const handleRelationPickerEntitySelected = (
    selectedRelationEntity?: EntityForSelect,
  ) => {
    closeDropdown();

    if (!selectedRelationEntity?.id) return;

    if (isToOneObject) {
      persistField(selectedRelationEntity.record);
      return;
    }

    if (!relationFieldMetadataItem?.name) return;

    updateOneRelationRecord({
      idToUpdate: selectedRelationEntity.id,
      updateOneRecordInput: {
        [`${relationFieldMetadataItem.name}Id`]: entityId,
        [relationFieldMetadataItem.name]: record,
      },
    });

    modifyRecordFromCache(entityId, {
      [fieldName]: (relationRef, { readField }) => {
        const edges = readField<{ node: Reference }[]>('edges', relationRef);

        if (!edges) {
          return relationRef;
        }

        return {
          ...relationRef,
          edges: [...edges, { node: record }],
        };
      },
    });
  };

  const filterQueryParams: FilterQueryParams = {
    filter: {
      [relationFieldMetadataItem?.name || '']: {
        [ViewFilterOperand.Is]: [entityId],
      },
    },
  };
  const filterLinkHref = `/objects/${
    relationObjectMetadataItem.namePlural
  }?${qs.stringify(filterQueryParams)}`;

  return (
    <Section>
      <RelationPickerScope relationPickerScopeId={dropdownId}>
        <StyledHeader isDropdownOpen={isDropdownOpen}>
          <StyledTitle>
            <StyledTitleLabel>{fieldDefinition.label}</StyledTitleLabel>
            {parseFieldRelationType(relationFieldMetadataItem) ===
              'TO_ONE_OBJECT' && (
              <StyledLink to={filterLinkHref}>
                All ({relationRecords.length})
              </StyledLink>
            )}
          </StyledTitle>
          <DropdownScope dropdownScopeId={dropdownId}>
            <StyledAddDropdown
              dropdownId={dropdownId}
              dropdownPlacement="right-start"
              onClose={handleCloseRelationPickerDropdown}
              clickableComponent={
                <LightIconButton
                  className="displayOnHover"
                  Icon={IconPlus}
                  accent="tertiary"
                />
              }
              dropdownComponents={
                <SingleEntitySelectMenuItemsWithSearch
                  EmptyIcon={IconForbid}
                  entitiesToSelect={entities.entitiesToSelect}
                  loading={entities.loading}
                  onEntitySelected={handleRelationPickerEntitySelected}
                />
              }
              dropdownHotkeyScope={{
                scope: dropdownId,
              }}
            />
          </DropdownScope>
        </StyledHeader>
        {!!relationRecords.length && (
          <Card>
            {relationRecords.slice(0, 5).map((relationRecord, index) => (
              <RecordRelationFieldCardContent
                key={`${relationRecord.id}${relationLabelIdentifierFieldMetadata?.id}`}
                divider={index < relationRecords.length - 1}
                relationRecord={relationRecord}
              />
            ))}
          </Card>
        )}
      </RelationPickerScope>
    </Section>
  );
};
