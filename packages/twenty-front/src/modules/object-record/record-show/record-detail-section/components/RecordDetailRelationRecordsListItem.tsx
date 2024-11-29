import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useCallback, useContext, useState } from 'react';
import {
  AnimatedEaseInOut,
  IconChevronDown,
  IconComponent,
  IconDotsVertical,
  IconTrash,
  IconUnlink,
  LightIconButton,
  MenuItem,
} from 'twenty-ui';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  FieldContext,
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/record-field/contexts/FieldContext';
import { useIsFieldValueReadOnly } from '@/object-record/record-field/hooks/useIsFieldValueReadOnly';
import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { FieldRelationMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import { RecordDetailRecordsListItem } from '@/object-record/record-show/record-detail-section/components/RecordDetailRecordsListItem';
import { RecordValueSetterEffect } from '@/object-record/record-store/components/RecordValueSetterEffect';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isFieldCellSupported } from '@/object-record/utils/isFieldCellSupported';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { createPortal } from 'react-dom';
import { RelationDefinitionType } from '~/generated-metadata/graphql';

const StyledListItem = styled(RecordDetailRecordsListItem)<{
  isDropdownOpen?: boolean;
}>`
  ${({ isDropdownOpen, theme }) =>
    !isDropdownOpen &&
    css`
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

const StyledPropertyBox = styled(PropertyBox)`
  align-items: flex-start;
  display: flex;
  padding-left: ${({ theme }) => theme.spacing(0)};
  padding-top: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(0)};
`;

const StyledClickableZone = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  flex: 1 0 auto;
  height: 100%;
  justify-content: flex-end;
`;

const MotionIconChevronDown = motion(IconChevronDown);

type RecordDetailRelationRecordsListItemProps = {
  isExpanded: boolean;
  onClick: (relationRecordId: string) => void;
  relationRecord: ObjectRecord;
};

export const RecordDetailRelationRecordsListItem = ({
  isExpanded,
  onClick,
  relationRecord,
}: RecordDetailRelationRecordsListItemProps) => {
  const { fieldDefinition } = useContext(FieldContext);

  const [isDeleteRelationModalOpen, setIsDeleteRelationModalOpen] =
    useState(false);

  const {
    relationFieldMetadataId,
    relationObjectMetadataNameSingular,
    relationType,
  } = fieldDefinition.metadata as FieldRelationMetadata;

  const isToOneObject = relationType === RelationDefinitionType.ManyToOne;
  const { objectMetadataItem: relationObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: relationObjectMetadataNameSingular,
    });

  const relationObjectTypeName = getObjectTypename(
    relationObjectMetadataNameSingular,
  );

  const { objectMetadataItems } = useObjectMetadataItems();

  const persistField = usePersistField();

  const { updateOneRecord: updateOneRelationRecord } = useUpdateOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
  });
  const { deleteOneRecord: deleteOneRelationRecord } = useDeleteOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
  });

  const isAccountOwnerRelation =
    relationObjectMetadataNameSingular ===
    CoreObjectNameSingular.WorkspaceMember;

  const availableRelationFieldMetadataItems = relationObjectMetadataItem.fields
    .filter(
      (fieldMetadataItem) =>
        isFieldCellSupported(fieldMetadataItem, objectMetadataItems) &&
        fieldMetadataItem.id !==
          relationObjectMetadataItem.labelIdentifierFieldMetadataId &&
        fieldMetadataItem.id !== relationFieldMetadataId,
    )
    .sort();

  const dropdownScopeId = `record-field-card-menu-${relationFieldMetadataId}-${relationRecord.id}`;

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
    setIsDeleteRelationModalOpen(true);
    closeDropdown();
  };

  const handleConfirmDelete = async () => {
    await deleteOneRelationRecord(relationRecord.id);
    setIsDeleteRelationModalOpen(false);
  };

  const useUpdateOneObjectRecordMutation: RecordUpdateHook = () => {
    const updateEntity = ({ variables }: RecordUpdateHookParams) => {
      updateOneRelationRecord?.({
        idToUpdate: variables.where.id as string,
        updateOneRecordInput: variables.updateOneRecordInput,
      });
    };

    return [updateEntity, { loading: false }];
  };

  const handleClick = () => onClick(relationRecord.id);

  const AnimatedIconChevronDown = useCallback<IconComponent>(
    (props) => (
      <MotionIconChevronDown
        className={props.className}
        color={props.color}
        size={props.size}
        stroke={props.stroke}
        initial={{ rotate: isExpanded ? 0 : -180 }}
        animate={{ rotate: isExpanded ? -180 : 0 }}
      />
    ),
    [isExpanded],
  );

  const isReadOnly = useIsFieldValueReadOnly();

  return (
    <>
      <RecordValueSetterEffect recordId={relationRecord.id} />
      <StyledListItem isDropdownOpen={isDropdownOpen}>
        <RecordChip
          record={relationRecord}
          objectNameSingular={relationObjectMetadataItem.nameSingular}
        />
        <StyledClickableZone onClick={handleClick}>
          <LightIconButton
            className="displayOnHover"
            Icon={AnimatedIconChevronDown}
            accent="tertiary"
          />
        </StyledClickableZone>
        {!isReadOnly && (
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
              dropdownHotkeyScope={{ scope: dropdownScopeId }}
            />
          </DropdownScope>
        )}
      </StyledListItem>
      <AnimatedEaseInOut isOpen={isExpanded}>
        <StyledPropertyBox>
          {availableRelationFieldMetadataItems.map(
            (fieldMetadataItem, index) => (
              <FieldContext.Provider
                key={fieldMetadataItem.id}
                value={{
                  recordId: relationRecord.id,
                  maxWidth: 200,
                  recoilScopeId: `${relationRecord.id}-${fieldMetadataItem.id}`,
                  isLabelIdentifier: false,
                  fieldDefinition: formatFieldMetadataItemAsColumnDefinition({
                    field: fieldMetadataItem,
                    position: index,
                    objectMetadataItem: relationObjectMetadataItem,
                    showLabel: true,
                    labelWidth: 90,
                  }),
                  useUpdateRecord: useUpdateOneObjectRecordMutation,
                  hotkeyScope: InlineCellHotkeyScope.InlineCell,
                }}
              >
                <RecordInlineCell />
              </FieldContext.Provider>
            ),
          )}
        </StyledPropertyBox>
      </AnimatedEaseInOut>
      {createPortal(
        <ConfirmationModal
          isOpen={isDeleteRelationModalOpen}
          setIsOpen={setIsDeleteRelationModalOpen}
          title={`Delete Related ${relationObjectTypeName}`}
          subtitle={
            <>
              Are you sure you want to delete this related{' '}
              {relationObjectMetadataNameSingular}?
              <br />
              This action will break all its relationships with other objects.
            </>
          }
          onConfirmClick={handleConfirmDelete}
          deleteButtonText={`Delete ${relationObjectTypeName}`}
        />,
        document.body,
      )}
    </>
  );
};
