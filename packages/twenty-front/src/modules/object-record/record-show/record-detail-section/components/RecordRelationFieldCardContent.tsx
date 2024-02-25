import { useContext } from 'react';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { LightIconButton, MenuItem } from 'tsup.ui.index';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord.ts';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { FieldRelationMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { IconDotsVertical, IconTrash, IconUnlink } from '@/ui/display/icon';
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
  const { fieldDefinition } = useContext(FieldContext);

  const {
    relationFieldMetadataId,
    relationObjectMetadataNameSingular,
    relationType,
    objectMetadataNameSingular,
  } = fieldDefinition.metadata as FieldRelationMetadata;

  const isToOneObject = relationType === 'TO_ONE_OBJECT';
  const { objectMetadataItem: relationObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: relationObjectMetadataNameSingular,
    });
  const persistField = usePersistField();
  const { updateOneRecord: updateOneRelationRecord } = useUpdateOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
  });

  const { deleteOneRecord: deleteOneRelationRecord } = useDeleteOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
  });

  const dropdownScopeId = `record-field-card-menu-${relationRecord.id}`;

  const { closeDropdown, isDropdownOpen } = useDropdown(dropdownScopeId);

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
        [relationFieldMetadataItem.name]: null,
      },
    });
  };

  const handleDelete = async () => {
    closeDropdown();
    await deleteOneRelationRecord(relationRecord.id);
  };

  const isOpportunityCompanyRelation =
    (objectMetadataNameSingular === CoreObjectNameSingular.Opportunity &&
      relationObjectMetadataNameSingular === CoreObjectNameSingular.Company) ||
    (objectMetadataNameSingular === CoreObjectNameSingular.Company &&
      relationObjectMetadataNameSingular ===
        CoreObjectNameSingular.Opportunity);

  const isAccountOwnerRelation =
    relationObjectMetadataNameSingular ===
    CoreObjectNameSingular.WorkspaceMember;

  return (
    <StyledCardContent isDropdownOpen={isDropdownOpen} divider={divider}>
      <RecordChip
        record={relationRecord}
        objectNameSingular={relationObjectMetadataItem.nameSingular}
      />
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
                {!isAccountOwnerRelation && (
                  <MenuItem
                    LeftIcon={IconTrash}
                    text="Delete"
                    accent="danger"
                    onClick={handleDelete}
                  />
                )}
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
