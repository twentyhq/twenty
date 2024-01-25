import { useContext, useEffect } from 'react';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';
import { LightIconButton, MenuItem } from 'tsup.ui.index';

import { CachedObjectRecordEdge } from '@/apollo/types/CachedObjectRecordEdge';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldDisplay } from '@/object-record/field/components/FieldDisplay';
import { FieldContext } from '@/object-record/field/contexts/FieldContext';
import { usePersistField } from '@/object-record/field/hooks/usePersistField';
import { entityFieldsFamilyState } from '@/object-record/field/states/entityFieldsFamilyState';
import { FieldRelationMetadata } from '@/object-record/field/types/FieldMetadata';
import { useFieldContext } from '@/object-record/hooks/useFieldContext';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { IconDotsVertical, IconUnlink } from '@/ui/display/icon';
import { CardContent } from '@/ui/layout/card/components/CardContent';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';

const StyledCardContent = styled(CardContent)<{
  isDropdownOpen?: boolean;
}>`
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
  display: flex;
  height: ${({ theme }) => theme.spacing(10)};
  padding: ${({ theme }) => theme.spacing(0, 2, 0, 3)};

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

type RecordRelationFieldCardContentProps = {
  divider?: boolean;
  relationRecord: ObjectRecord;
};

export const RecordRelationFieldCardContent = ({
  divider,
  relationRecord,
}: RecordRelationFieldCardContentProps) => {
  const { fieldDefinition, entityId } = useContext(FieldContext);

  const {
    relationFieldMetadataId,
    relationObjectMetadataNameSingular,
    relationType,
    fieldName,
    objectMetadataNameSingular,
  } = fieldDefinition.metadata as FieldRelationMetadata;

  const { modifyRecordFromCache } = useObjectMetadataItem({
    objectNameSingular: objectMetadataNameSingular ?? '',
  });

  const isToOneObject = relationType === 'TO_ONE_OBJECT';
  const {
    labelIdentifierFieldMetadata: relationLabelIdentifierFieldMetadata,
    objectMetadataItem: relationObjectMetadataItem,
  } = useObjectMetadataItem({
    objectNameSingular: relationObjectMetadataNameSingular,
  });
  const persistField = usePersistField();
  const { updateOneRecord: updateOneRelationRecord } = useUpdateOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
  });

  const { FieldContextProvider } = useFieldContext({
    fieldMetadataName: relationLabelIdentifierFieldMetadata?.name || '',
    fieldPosition: 0,
    isLabelIdentifier: true,
    objectNameSingular: relationObjectMetadataNameSingular,
    objectRecordId: relationRecord.id,
  });

  const dropdownScopeId = `record-field-card-menu-${relationRecord.id}`;

  const { closeDropdown, isDropdownOpen } = useDropdown(dropdownScopeId);

  // TODO: temporary as ChipDisplay expect to find the entity in the entityFieldsFamilyState
  const setRelationEntityFields = useSetRecoilState(
    entityFieldsFamilyState(relationRecord.id),
  );

  useEffect(() => {
    setRelationEntityFields(relationRecord);
  }, [relationRecord, setRelationEntityFields]);

  if (!FieldContextProvider) return null;

  const handleDetach = () => {
    closeDropdown();

    const relationFieldMetadataItem = relationObjectMetadataItem.fields.find(
      ({ id }) => id === relationFieldMetadataId,
    );

    if (!relationFieldMetadataItem?.name) return;

    if (isToOneObject) {
      persistField(null);
      return;
    }

    updateOneRelationRecord({
      idToUpdate: relationRecord.id,
      updateOneRecordInput: {
        [`${relationFieldMetadataItem.name}Id`]: null,
        [relationFieldMetadataItem.name]: null,
      },
    });

    modifyRecordFromCache(entityId, {
      [fieldName]: (cachedRelationConnection, { readField }) => {
        const edges = readField<CachedObjectRecordEdge[]>(
          'edges',
          cachedRelationConnection,
        );

        if (!edges) {
          return cachedRelationConnection;
        }

        return {
          ...cachedRelationConnection,
          edges: edges.filter(({ node }) => {
            const id = readField('id', node);
            return id !== relationRecord.id;
          }),
        };
      },
    });
  };

  const isOpportunityCompanyRelation =
    (objectMetadataNameSingular === CoreObjectNameSingular.Opportunity &&
      relationObjectMetadataNameSingular === CoreObjectNameSingular.Company) ||
    (objectMetadataNameSingular === CoreObjectNameSingular.Company &&
      relationObjectMetadataNameSingular ===
        CoreObjectNameSingular.Opportunity);

  return (
    <StyledCardContent isDropdownOpen={isDropdownOpen} divider={divider}>
      <FieldContextProvider>
        <FieldDisplay />
      </FieldContextProvider>
      {/* TODO: temporary to prevent removing a company from an opportunity */}
      {!isOpportunityCompanyRelation && (
        <DropdownScope dropdownScopeId={dropdownScopeId}>
          <Dropdown
            dropdownId={dropdownScopeId}
            dropdownPlacement="right-start"
            clickableComponent={
              <LightIconButton
                className="displayOnHover"
                Icon={IconDotsVertical}
                accent="tertiary"
              />
            }
            dropdownComponents={
              <DropdownMenuItemsContainer>
                <MenuItem
                  LeftIcon={IconUnlink}
                  text="Detach"
                  onClick={handleDetach}
                />
              </DropdownMenuItemsContainer>
            }
            dropdownHotkeyScope={{
              scope: dropdownScopeId,
            }}
          />
        </DropdownScope>
      )}
    </StyledCardContent>
  );
};
