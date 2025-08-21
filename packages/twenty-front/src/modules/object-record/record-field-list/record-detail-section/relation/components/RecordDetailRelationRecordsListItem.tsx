import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useCallback, useContext } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RecordFieldList } from '@/object-record/record-field-list/components/RecordFieldList';
import { RecordDetailRecordsListItemContainer } from '@/object-record/record-field-list/record-detail-section/components/RecordDetailRecordsListItemContainer';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { getRecordFieldCardRelationPickerDropdownId } from '@/object-record/record-show/utils/getRecordFieldCardRelationPickerDropdownId';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getForeignKeyNameFromRelationFieldName } from '@/object-record/utils/getForeignKeyNameFromRelationFieldName';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useIsInRightDrawerOrThrow } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { createPortal } from 'react-dom';
import {
  IconChevronDown,
  IconDotsVertical,
  IconTrash,
  IconUnlink,
  type IconComponent,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { AnimatedEaseInOut } from 'twenty-ui/utilities';
import { RelationType } from '~/generated-metadata/graphql';

const StyledListItem = styled(RecordDetailRecordsListItemContainer)<{
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

  padding-left: ${({ theme }) => theme.spacing(3)};
  padding-right: ${({ theme }) => theme.spacing(2)};

  &:hover {
    .displayOnHover {
      opacity: 1;
      pointer-events: auto;
    }
  }
`;

const StyledClickableZone = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  flex: 1 0 auto;
  height: 100%;
  justify-content: flex-end;
`;

const MotionIconChevronDown = motion.create(IconChevronDown);

const getDeleteRelationModalId = (recordId: string) =>
  `delete-relation-modal-${recordId}`;

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
  const {
    fieldDefinition,
    recordId,
    isRecordFieldReadOnly: parentIsRecordFieldReadOnly,
  } = useContext(FieldContext);

  const { onSubmit } = useContext(FieldInputEventContext);

  const { openModal } = useModal();

  const {
    relationFieldMetadataId,
    relationObjectMetadataNameSingular,
    relationType,
  } = fieldDefinition.metadata as FieldRelationMetadata;

  const isToOneObject = relationType === RelationType.MANY_TO_ONE;
  const { objectMetadataItem: relationObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: relationObjectMetadataNameSingular,
    });

  const relationObjectTypeName = getObjectTypename(
    relationObjectMetadataNameSingular,
  );

  const relationObjectPermissions = useObjectPermissionsForObject(
    relationObjectMetadataItem.id,
  );

  const { updateOneRecord: updateOneRelationRecord } = useUpdateOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
  });
  const { deleteOneRecord: deleteOneRelationRecord } = useDeleteOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
  });

  const isAccountOwnerRelation =
    relationObjectMetadataNameSingular ===
    CoreObjectNameSingular.WorkspaceMember;

  const dropdownInstanceId = `record-field-card-menu-${relationFieldMetadataId}-${relationRecord.id}`;

  const { closeDropdown } = useCloseDropdown();
  const isDropdownOpen = useRecoilComponentValue(
    isDropdownOpenComponentState,
    dropdownInstanceId,
  );

  const dropdownId = getRecordFieldCardRelationPickerDropdownId({
    fieldDefinition,
    recordId,
  });
  const setSingleRecordPickerSelectedId = useSetRecoilComponentState(
    singleRecordPickerSelectedIdComponentState,
    dropdownId,
  );

  const relationFieldMetadataItem = relationObjectMetadataItem.fields.find(
    ({ id }) => id === relationFieldMetadataId,
  );

  const handleDetach = () => {
    closeDropdown(dropdownInstanceId);

    if (!relationFieldMetadataItem?.name) return;

    if (isToOneObject) {
      onSubmit?.({ newValue: null });
    } else {
      updateOneRelationRecord({
        idToUpdate: relationRecord.id,
        updateOneRecordInput: {
          [getForeignKeyNameFromRelationFieldName(
            relationFieldMetadataItem.name,
          )]: null,
        },
      });
    }

    setSingleRecordPickerSelectedId(undefined);
  };

  const handleDelete = async () => {
    closeDropdown(dropdownInstanceId);
    openModal(getDeleteRelationModalId(relationRecord.id));
  };

  const handleConfirmDelete = async () => {
    await deleteOneRelationRecord(relationRecord.id);
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

  const { isInRightDrawer } = useIsInRightDrawerOrThrow();

  return (
    <>
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
        {!parentIsRecordFieldReadOnly && (
          <Dropdown
            dropdownId={dropdownInstanceId}
            dropdownPlacement="right-start"
            clickableComponent={
              <LightIconButton
                className="displayOnHover"
                Icon={IconDotsVertical}
                accent="tertiary"
              />
            }
            dropdownComponents={
              <DropdownContent>
                <DropdownMenuItemsContainer>
                  <MenuItem
                    LeftIcon={IconUnlink}
                    text="Detach"
                    onClick={handleDetach}
                  />
                  {!isAccountOwnerRelation &&
                    relationObjectPermissions.canSoftDeleteObjectRecords && (
                      <MenuItem
                        LeftIcon={IconTrash}
                        text="Delete"
                        accent="danger"
                        onClick={handleDelete}
                      />
                    )}
                </DropdownMenuItemsContainer>
              </DropdownContent>
            }
          />
        )}
      </StyledListItem>
      <AnimatedEaseInOut isOpen={isExpanded}>
        <RecordFieldList
          instanceId={`record-detail-relation-${relationRecord.id}-${isInRightDrawer ? 'right-drawer' : ''}`}
          objectNameSingular={relationObjectMetadataNameSingular}
          objectRecordId={relationRecord.id}
          showDuplicatesSection={false}
          showRelationSections={false}
          excludeCreatedAtAndUpdatedAt={true}
          excludeFieldMetadataIds={[relationFieldMetadataId]}
        />
      </AnimatedEaseInOut>
      {createPortal(
        <ConfirmationModal
          modalId={getDeleteRelationModalId(relationRecord.id)}
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
          confirmButtonText={`Delete ${relationObjectTypeName}`}
        />,
        document.body,
      )}
    </>
  );
};
