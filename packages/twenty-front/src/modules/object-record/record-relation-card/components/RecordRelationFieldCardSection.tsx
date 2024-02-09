import { useCallback, useContext } from 'react';
import { Link } from 'react-router-dom';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import qs from 'qs';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { FieldRelationMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordRelationFieldCardContent } from '@/object-record/record-relation-card/components/RecordRelationFieldCardContent';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { SingleEntitySelectMenuItemsWithSearch } from '@/object-record/relation-picker/components/SingleEntitySelectMenuItemsWithSearch';
import { useRelationPicker } from '@/object-record/relation-picker/hooks/useRelationPicker';
import { RelationPickerScope } from '@/object-record/relation-picker/scopes/RelationPickerScope';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { IconForbid, IconPencil, IconPlus } from '@/ui/display/icon';
import { useIcons } from '@/ui/display/icon/hooks/useIcons';
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

const StyledCardNoContent = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.light};

  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  display: flex;
  height: ${({ theme }) => theme.spacing(10)};
  padding: ${({ theme }) => theme.spacing(0, 2)};
`;

export const RecordRelationFieldCardSection = () => {
  const theme = useTheme();

  const { entityId, fieldDefinition } = useContext(FieldContext);
  const {
    fieldName,
    relationFieldMetadataId,
    relationObjectMetadataNameSingular,
    relationType,
  } = fieldDefinition.metadata as FieldRelationMetadata;
  const record = useRecoilValue(recordStoreFamilyState(entityId));

  const {
    labelIdentifierFieldMetadata: relationLabelIdentifierFieldMetadata,
    objectMetadataItem: relationObjectMetadataItem,
  } = useObjectMetadataItem({
    objectNameSingular: relationObjectMetadataNameSingular,
  });

  const relationFieldMetadataItem = relationObjectMetadataItem.fields.find(
    ({ id }) => id === relationFieldMetadataId,
  );

  const fieldValue = useRecoilValue<
    ({ id: string } & Record<string, any>) | null
  >(recordStoreFamilySelector({ recordId: entityId, fieldName }));

  const isToOneObject = relationType === 'TO_ONE_OBJECT';
  const isFromManyObjects = relationType === 'FROM_MANY_OBJECTS';

  const relationRecords: ObjectRecord[] =
    fieldValue && isToOneObject
      ? [fieldValue]
      : fieldValue?.edges.map(({ node }: { node: ObjectRecord }) => node) ?? [];
  const relationRecordIds = relationRecords.map(({ id }) => id);

  const dropdownId = `record-field-card-relation-picker-${fieldDefinition.label}`;

  const { closeDropdown, isDropdownOpen } = useDropdown(dropdownId);

  const { setRelationPickerSearchFilter } = useRelationPicker({
    relationPickerScopeId: dropdownId,
  });

  const handleCloseRelationPickerDropdown = useCallback(() => {
    setRelationPickerSearchFilter('');
  }, [setRelationPickerSearchFilter]);

  const persistField = usePersistField();
  const { updateOneRecord: updateOneRelationRecord } = useUpdateOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
  });

  const handleRelationPickerEntitySelected = (
    selectedRelationEntity?: EntityForSelect,
  ) => {
    closeDropdown();

    if (!selectedRelationEntity?.id || !relationFieldMetadataItem?.name) return;

    if (isToOneObject) {
      persistField(selectedRelationEntity.record);
      return;
    }

    updateOneRelationRecord({
      idToUpdate: selectedRelationEntity.id,
      updateOneRecordInput: {
        [relationFieldMetadataItem.name]: record,
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

  const { getIcon } = useIcons();
  const Icon = getIcon(relationObjectMetadataItem.icon);

  return (
    <Section>
      <StyledHeader isDropdownOpen={isDropdownOpen}>
        <StyledTitle>
          <StyledTitleLabel>{fieldDefinition.label}</StyledTitleLabel>
          {isFromManyObjects && (
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
                Icon={isToOneObject ? IconPencil : IconPlus}
                accent="tertiary"
              />
            }
            dropdownComponents={
              <RelationPickerScope relationPickerScopeId={dropdownId}>
                <SingleEntitySelectMenuItemsWithSearch
                  EmptyIcon={IconForbid}
                  onEntitySelected={handleRelationPickerEntitySelected}
                  selectedRelationRecordIds={relationRecordIds}
                  relationObjectNameSingular={
                    relationObjectMetadataNameSingular
                  }
                  relationPickerScopeId={dropdownId}
                />
              </RelationPickerScope>
            }
            dropdownHotkeyScope={{
              scope: dropdownId,
            }}
          />
        </DropdownScope>
      </StyledHeader>
      {relationRecords.length === 0 && (
        <StyledCardNoContent>
          <Icon size={theme.icon.size.sm} />
          <div>No {relationObjectMetadataItem.labelSingular}</div>
        </StyledCardNoContent>
      )}
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
    </Section>
  );
};
