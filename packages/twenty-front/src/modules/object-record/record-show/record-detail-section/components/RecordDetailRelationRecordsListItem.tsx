import { useCallback, useContext } from 'react';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import {
  IconChevronDown,
  IconDotsVertical,
  IconTrash,
  IconUnlink,
} from 'twenty-ui';

import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord.ts';
import { useLazyFindOneRecord } from '@/object-record/hooks/useLazyFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  FieldContext,
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/record-field/contexts/FieldContext';
import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { FieldRelationMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import { RecordDetailRecordsListItem } from '@/object-record/record-show/record-detail-section/components/RecordDetailRecordsListItem';
import { useSetRecordInStore } from '@/object-record/record-store/hooks/useSetRecordInStore';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isFieldCellSupported } from '@/object-record/utils/isFieldCellSupported';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { AnimatedEaseInOut } from '@/ui/utilities/animation/components/AnimatedEaseInOut';

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

  const {
    relationFieldMetadataId,
    relationObjectMetadataNameSingular,
    relationType,
  } = fieldDefinition.metadata as FieldRelationMetadata;

  const isToOneObject = relationType === 'TO_ONE_OBJECT';
  const { objectMetadataItem: relationObjectMetadataItem } =
    useObjectMetadataItemOnly({
      objectNameSingular: relationObjectMetadataNameSingular,
    });

  const persistField = usePersistField();

  const {
    called: hasFetchedRelationRecord,
    findOneRecord: findOneRelationRecord,
  } = useLazyFindOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
  });
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
        isFieldCellSupported(fieldMetadataItem) &&
        fieldMetadataItem.id !==
          relationObjectMetadataItem.labelIdentifierFieldMetadataId &&
        fieldMetadataItem.id !== relationFieldMetadataId,
    )
    .sort();

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

  const useUpdateOneObjectRecordMutation: RecordUpdateHook = () => {
    const updateEntity = ({ variables }: RecordUpdateHookParams) => {
      updateOneRelationRecord?.({
        idToUpdate: variables.where.id as string,
        updateOneRecordInput: variables.updateOneRecordInput,
      });
    };

    return [updateEntity, { loading: false }];
  };

  const { setRecords } = useSetRecordInStore();

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

  return (
    <>
      <StyledListItem isDropdownOpen={isDropdownOpen}>
        <RecordChip
          record={relationRecord}
          objectNameSingular={relationObjectMetadataItem.nameSingular}
        />
        <StyledClickableZone
          onClick={handleClick}
          onMouseOver={() =>
            !hasFetchedRelationRecord &&
            findOneRelationRecord({
              objectRecordId: relationRecord.id,
              onCompleted: (record) => setRecords([record]),
            })
          }
        >
          <LightIconButton
            className="displayOnHover"
            Icon={AnimatedIconChevronDown}
            accent="tertiary"
          />
        </StyledClickableZone>
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
      </StyledListItem>
      <AnimatedEaseInOut isOpen={isExpanded}>
        <PropertyBox>
          {availableRelationFieldMetadataItems.map(
            (fieldMetadataItem, index) => (
              <FieldContext.Provider
                key={fieldMetadataItem.id}
                value={{
                  entityId: relationRecord.id,
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
        </PropertyBox>
      </AnimatedEaseInOut>
    </>
  );
};
