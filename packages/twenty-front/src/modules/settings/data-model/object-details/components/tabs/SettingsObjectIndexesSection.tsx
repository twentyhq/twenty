import { useDeleteOneIndexMetadataItem } from '@/object-metadata/hooks/useDeleteOneIndexMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useMemo, useState } from 'react';
import { IconEyeOff, IconPlus } from 'twenty-ui-deprecated/display';
import { Button, SearchInput } from 'twenty-ui-deprecated/input';
import { MenuItemToggle, UndecoratedLink } from 'twenty-ui-deprecated/navigation';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';
import { SettingsPath } from 'twenty-shared/types';
import { isNonEmptyString } from '@sniptt/guards';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { normalizeSearchText } from '~/utils/normalizeSearchText';
import { MAX_CUSTOM_INDEXES_PER_OBJECT } from 'twenty-shared/constants';
import { SettingsObjectIndexTable } from '~/pages/settings/data-model/SettingsObjectIndexTable';
import { type SettingsObjectIndexesTableItem } from '~/pages/settings/data-model/types/SettingsObjectIndexesTableItem';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { type CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';

type SettingsObjectIndexesSectionProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  isReadOnly: boolean;
};

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[2]};
`;

const DELETE_INDEX_MODAL_ID = 'delete-index-modal';
const HIDE_SYSTEM_INDEXES_DROPDOWN_ID =
  'settings-object-indexes-filter-dropdown';

export const SettingsObjectIndexesSection = ({
  objectMetadataItem,
  isReadOnly,
}: SettingsObjectIndexesSectionProps) => {
  const { t } = useLingui();
  const { openModal, closeModal } = useModal();
  const { enqueueSuccessSnackBar } = useSnackBar();
  const { deleteOneIndexMetadataItem } = useDeleteOneIndexMetadataItem();

  const [searchTerm, setSearchTerm] = useState('');
  const [hideSystemIndexes, setHideSystemIndexes] = useState(false);
  const [pendingDelete, setPendingDelete] =
    useState<SettingsObjectIndexesTableItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const tableItems = useMemo<SettingsObjectIndexesTableItem[]>(() => {
    const fieldsById = new Map(
      objectMetadataItem.fields.map((field) => [field.id, field]),
    );

    return objectMetadataItem.indexMetadatas.map((indexMetadataItem) => ({
      id: indexMetadataItem.id,
      name: indexMetadataItem.name,
      isUnique: indexMetadataItem.isUnique,
      isCustom: indexMetadataItem.isCustom ?? false,
      indexType: indexMetadataItem.indexType,
      indexWhereClause: indexMetadataItem.indexWhereClause,
      indexFields:
        indexMetadataItem.indexFieldMetadatas
          ?.map((indexField) => {
            const fieldMetadataItem = fieldsById.get(
              indexField.fieldMetadataId,
            );

            if (!isDefined(fieldMetadataItem)) return undefined;

            if (isNonEmptyString(indexField.subFieldName)) {
              return `${fieldMetadataItem.label} > ${getCompositeSubFieldLabel(
                fieldMetadataItem.type as CompositeFieldType,
                indexField.subFieldName as CompositeFieldSubFieldName,
              )}`;
            }

            return fieldMetadataItem.label;
          })
          .filter((label): label is string => Boolean(label))
          .join(', ') ?? '',
    }));
  }, [objectMetadataItem.indexMetadatas, objectMetadataItem.fields]);

  const filteredItems = useMemo(() => {
    const searchNormalized = normalizeSearchText(searchTerm);

    return tableItems
      .filter((item) => (hideSystemIndexes ? item.isCustom : true))
      .filter((item) =>
        searchNormalized.length === 0
          ? true
          : normalizeSearchText(item.indexFields).includes(searchNormalized) ||
            normalizeSearchText(item.indexType).includes(searchNormalized),
      );
  }, [tableItems, searchTerm, hideSystemIndexes]);

  const customIndexCount = tableItems.filter((item) => item.isCustom).length;
  const reachedCap = customIndexCount >= MAX_CUSTOM_INDEXES_PER_OBJECT;
  const canCreate = !isReadOnly && !reachedCap;

  const handleRequestDelete = (item: SettingsObjectIndexesTableItem) => {
    setPendingDelete(item);
    openModal(DELETE_INDEX_MODAL_ID);
  };

  const handleConfirmDelete = async () => {
    if (pendingDelete === null) return;
    setIsDeleting(true);

    const result = await deleteOneIndexMetadataItem({
      idToDelete: pendingDelete.id,
    });

    setIsDeleting(false);
    closeModal(DELETE_INDEX_MODAL_ID);

    if (result.status === 'successful') {
      enqueueSuccessSnackBar({ message: t`Index deleted` });
      setPendingDelete(null);
    }
  };

  return (
    <StyledContent>
      <SearchInput
        placeholder={t`Search an index...`}
        value={searchTerm}
        onChange={setSearchTerm}
        filterDropdown={(filterButton: ReactNode) => (
          <Dropdown
            dropdownId={HIDE_SYSTEM_INDEXES_DROPDOWN_ID}
            dropdownPlacement="bottom-end"
            dropdownOffset={{ x: 0, y: 8 }}
            clickableComponent={filterButton}
            dropdownComponents={
              <DropdownContent>
                <DropdownMenuItemsContainer>
                  <MenuItemToggle
                    LeftIcon={IconEyeOff}
                    onToggleChange={() =>
                      setHideSystemIndexes(!hideSystemIndexes)
                    }
                    toggled={hideSystemIndexes}
                    text={t`Hide system indexes`}
                    toggleSize="small"
                  />
                </DropdownMenuItemsContainer>
              </DropdownContent>
            }
          />
        )}
      />
      <SettingsObjectIndexTable
        items={filteredItems}
        isReadOnly={isReadOnly}
        onDeleteIndex={handleRequestDelete}
      />
      {!isReadOnly && (
        <StyledButtonContainer>
          {canCreate ? (
            <UndecoratedLink
              to={getSettingsPath(SettingsPath.ObjectNewIndex, {
                objectNamePlural: objectMetadataItem.namePlural,
              })}
            >
              <Button
                Icon={IconPlus}
                title={t`Add Index`}
                size="small"
                variant="secondary"
              />
            </UndecoratedLink>
          ) : (
            <Button
              Icon={IconPlus}
              title={t`Add Index`}
              size="small"
              variant="secondary"
              disabled
            />
          )}
        </StyledButtonContainer>
      )}
      <ConfirmationModal
        modalInstanceId={DELETE_INDEX_MODAL_ID}
        title={t`Delete this index?`}
        subtitle={t`Queries that relied on it will fall back to a sequential scan. You can recreate it later.`}
        confirmButtonText={t`Delete`}
        onConfirmClick={handleConfirmDelete}
        onClose={() => setPendingDelete(null)}
        loading={isDeleting}
      />
    </StyledContent>
  );
};
