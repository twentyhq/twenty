import { useCreateOneIndexMetadataItem } from '@/object-metadata/hooks/useCreateOneIndexMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SEARCH_VECTOR_FIELD_NAME } from '@/object-record/constants/SearchVectorFieldName';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { Checkbox } from 'twenty-ui/input';
import { Button } from 'twenty-ui/input';
import { ModalContent } from 'twenty-ui/layout';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { IndexType } from '~/generated-metadata/graphql';

type SettingsObjectCreateIndexModalProps = {
  modalInstanceId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
};

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding-top: ${themeCssVariables.spacing[3]};
`;

const StyledSectionLabel = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledFieldList = styled.div`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  max-height: 240px;
  overflow-y: auto;
`;

const StyledFieldRow = styled.label`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};

  &:last-child {
    border-bottom: none;
  }
`;

const StyledFieldLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledOrderBadge = styled.span`
  background-color: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  min-width: 18px;
  padding: 1px 6px;
  text-align: center;
`;

const StyledFooter = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[4]};
`;

// Fields the user shouldn't index manually: search vector (managed by Twenty),
// system fields, and any field the user can't read.
const isFieldIndexable = (field: FieldMetadataItem): boolean => {
  if (field.name === SEARCH_VECTOR_FIELD_NAME) return false;
  if (field.isSystem === true) return false;
  if (field.isActive !== true) return false;
  return true;
};

export const SettingsObjectCreateIndexModal = ({
  modalInstanceId,
  objectMetadataItem,
}: SettingsObjectCreateIndexModalProps) => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const { enqueueSuccessSnackBar } = useSnackBar();
  const { createOneIndexMetadataItem } = useCreateOneIndexMetadataItem();

  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);
  const [indexType, setIndexType] = useState<IndexType>(IndexType.BTREE);
  const [whereClause, setWhereClause] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const indexableFields = useMemo(
    () =>
      objectMetadataItem.fields
        .filter(isFieldIndexable)
        .sort((a, b) => a.label.localeCompare(b.label)),
    [objectMetadataItem.fields],
  );

  const handleToggleField = (fieldId: string) => {
    setSelectedFieldIds((prev) =>
      prev.includes(fieldId)
        ? prev.filter((id) => id !== fieldId)
        : [...prev, fieldId],
    );
  };

  const resetForm = () => {
    setSelectedFieldIds([]);
    setIndexType(IndexType.BTREE);
    setWhereClause('');
  };

  const handleClose = () => {
    resetForm();
    closeModal(modalInstanceId);
  };

  const handleSubmit = async () => {
    if (selectedFieldIds.length === 0) return;

    setIsSubmitting(true);
    const result = await createOneIndexMetadataItem({
      objectMetadataId: objectMetadataItem.id,
      fieldMetadataIds: selectedFieldIds,
      indexType,
      indexWhereClause:
        whereClause.trim().length > 0 ? whereClause.trim() : undefined,
    });
    setIsSubmitting(false);

    if (result.status === 'successful') {
      enqueueSuccessSnackBar({ message: t`Index created` });
      handleClose();
    }
  };

  const indexTypeOptions = [
    {
      value: IndexType.BTREE,
      label: t`BTREE (default, good for sorting and equality)`,
    },
    {
      value: IndexType.GIN,
      label: t`GIN (full-text search and JSONB)`,
    },
  ];

  return (
    <ModalStatefulWrapper
      modalInstanceId={modalInstanceId}
      isClosable
      padding="large"
      narrowWidth
      autoHeight
    >
      <ModalContent>
        <H1Title
          title={t`Add custom index`}
          fontColor={H1TitleFontColor.Primary}
        />
        <StyledBody>
          <div>
            <StyledSectionLabel>{t`Fields`}</StyledSectionLabel>
            <StyledFieldList>
              {indexableFields.map((field) => {
                const orderIndex = selectedFieldIds.indexOf(field.id);
                const isSelected = orderIndex !== -1;
                return (
                  <StyledFieldRow key={field.id}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleField(field.id)}
                    />
                    <StyledFieldLabel>{field.label}</StyledFieldLabel>
                    {isSelected && (
                      <StyledOrderBadge>{orderIndex + 1}</StyledOrderBadge>
                    )}
                  </StyledFieldRow>
                );
              })}
            </StyledFieldList>
          </div>
          <div>
            <StyledSectionLabel>{t`Type`}</StyledSectionLabel>
            <Select
              dropdownId="create-index-type"
              value={indexType}
              options={indexTypeOptions}
              onChange={(value) => setIndexType(value)}
              fullWidth
            />
          </div>
          <div>
            <StyledSectionLabel>
              {t`Partial WHERE clause (optional)`}
            </StyledSectionLabel>
            <SettingsTextInput
              instanceId="create-index-where"
              placeholder={t`active = true`}
              value={whereClause}
              onChange={setWhereClause}
              fullWidth
            />
          </div>
        </StyledBody>
        <StyledFooter>
          <Button
            title={t`Cancel`}
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          />
          <Button
            title={t`Create`}
            variant="primary"
            accent="blue"
            onClick={handleSubmit}
            disabled={selectedFieldIds.length === 0 || isSubmitting}
          />
        </StyledFooter>
      </ModalContent>
    </ModalStatefulWrapper>
  );
};
