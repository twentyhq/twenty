import { useContext } from 'react';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { LightIconButton, MenuItem } from 'tsup.ui.index';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { FieldDisplay } from '@/object-record/field/components/FieldDisplay';
import { FieldContext } from '@/object-record/field/contexts/FieldContext';
import { usePersistField } from '@/object-record/field/hooks/usePersistField';
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
  const { fieldDefinition } = useContext(FieldContext);
  const {
    relationFieldMetadataId,
    relationObjectMetadataNameSingular,
    relationType,
  } = fieldDefinition.metadata as FieldRelationMetadata;
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
  };

  return (
    <StyledCardContent isDropdownOpen={isDropdownOpen} divider={divider}>
      <FieldContextProvider>
        <FieldDisplay />
      </FieldContextProvider>
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
    </StyledCardContent>
  );
};
