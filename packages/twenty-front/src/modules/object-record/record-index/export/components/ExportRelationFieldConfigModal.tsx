import { type ExportConfig } from '@/object-record/record-index/export/types/ExportConfig';
import { useExportableRelationFields } from '@/object-record/record-index/export/hooks/useExportableRelationFields';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { ModalHeader } from 'twenty-ui/layout';
import { styled } from '@linaria/react';
import { useCallback, useState } from 'react';
import { t } from '@lingui/core/macro';
import {
  H1Title,
  H1TitleFontColor,
  IconChevronDown,
  IconChevronRight,
} from 'twenty-ui/display';
import { Button, Checkbox } from 'twenty-ui/input';
import { MenuItemMultiSelect } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type ExportRelationFieldConfigModalProps = {
  modalId: string;
  objectMetadataItem: ObjectMetadataItem;
  visibleFieldNames: string[];
  onExport: (config: ExportConfig) => void;
};

const StyledModalContent = styled.div`
  display: flex;
  flex: 1 1 0%;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  max-height: 60vh;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledFooter = styled.div`
  justify-content: flex-end;
  gap: ${themeCssVariables.spacing[2]};
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 60px;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[5]};
`;

const StyledRelationSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledRelationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing['1.5']} ${themeCssVariables.spacing[2]};
  cursor: pointer;
  border-radius: ${themeCssVariables.border.radius.sm};
  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledRelationLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledSubFieldCount = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledSubFieldList = styled.div`
  padding-left: ${themeCssVariables.spacing[6]};
`;

const StyledDescription = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[4]}
    ${themeCssVariables.spacing[2]};
`;

type RelationSelectionState = Record<string, Set<string>>;

export const ExportRelationFieldConfigModal = ({
  modalId,
  objectMetadataItem,
  visibleFieldNames,
  onExport,
}: ExportRelationFieldConfigModalProps) => {
  const { closeModal } = useModal();

  const exportableRelationFields = useExportableRelationFields({
    objectMetadataItem,
    visibleFieldNames,
  });

  const [expandedRelations, setExpandedRelations] = useState<Set<string>>(
    new Set(),
  );

  // Default: all fields selected for every relation
  const [selections, setSelections] = useState<RelationSelectionState>(() => {
    const initial: RelationSelectionState = {};
    for (const relation of exportableRelationFields) {
      initial[relation.fieldName] = new Set(
        relation.exportableSubFields.map((f) => f.fieldName),
      );
    }
    return initial;
  });

  const toggleExpanded = useCallback((fieldName: string) => {
    setExpandedRelations((prev) => {
      const next = new Set(prev);
      if (next.has(fieldName)) {
        next.delete(fieldName);
      } else {
        next.add(fieldName);
      }
      return next;
    });
  }, []);

  const toggleSubField = useCallback(
    (relationFieldName: string, subFieldName: string) => {
      setSelections((prev) => {
        const currentSet = prev[relationFieldName] ?? new Set();
        const next = new Set(currentSet);
        if (next.has(subFieldName)) {
          next.delete(subFieldName);
        } else {
          next.add(subFieldName);
        }
        return { ...prev, [relationFieldName]: next };
      });
    },
    [],
  );

  const toggleRelation = useCallback(
    (relationFieldName: string) => {
      const relation = exportableRelationFields.find(
        (r) => r.fieldName === relationFieldName,
      );
      if (!relation) return;

      setSelections((prev) => {
        const currentCount = prev[relationFieldName]?.size ?? 0;
        if (currentCount > 0) {
          return { ...prev, [relationFieldName]: new Set() };
        }
        return {
          ...prev,
          [relationFieldName]: new Set(
            relation.exportableSubFields.map((f) => f.fieldName),
          ),
        };
      });
    },
    [exportableRelationFields],
  );

  const handleExport = useCallback(() => {
    const relationConfigs = exportableRelationFields
      .filter((relation) => (selections[relation.fieldName]?.size ?? 0) > 0)
      .map((relation) => ({
        relationFieldName: relation.fieldName,
        relationFieldLabel: relation.fieldLabel,
        targetObjectNameSingular: relation.targetObjectNameSingular,
        selectedSubFields: Array.from(selections[relation.fieldName] ?? []),
      }));

    closeModal(modalId);
    onExport({ relationConfigs });
  }, [closeModal, exportableRelationFields, modalId, onExport, selections]);

  const handleCancel = useCallback(() => {
    closeModal(modalId);
  }, [closeModal, modalId]);

  const totalSelected = Object.values(selections).reduce(
    (sum, set) => sum + set.size,
    0,
  );

  return (
    <ModalStatefulWrapper
      modalInstanceId={modalId}
      size="medium"
      padding="none"
      isClosable={true}
    >
      <ModalHeader>
        <H1Title
          title={t`Export with Related Fields`}
          fontColor={H1TitleFontColor.Primary}
        />
      </ModalHeader>
      <StyledDescription>
        {t`Uncheck any related fields you don't need in the export.`}
      </StyledDescription>
      <StyledModalContent>
        {exportableRelationFields.map((relation) => {
          const isExpanded = expandedRelations.has(relation.fieldName);
          const selectedCount = selections[relation.fieldName]?.size ?? 0;
          const totalCount = relation.exportableSubFields.length;
          const allSelected = selectedCount === totalCount;
          const noneSelected = selectedCount === 0;

          return (
            <StyledRelationSection key={relation.fieldName}>
              <StyledRelationHeader
                onClick={() => toggleExpanded(relation.fieldName)}
              >
                <Checkbox
                  checked={!noneSelected}
                  indeterminate={!noneSelected && !allSelected}
                  hoverable
                  onCheckedChange={(checked) => {
                    if (!checked && !noneSelected) {
                      toggleRelation(relation.fieldName);
                    } else if (checked && noneSelected) {
                      toggleRelation(relation.fieldName);
                    }
                  }}
                  onChange={(e) => e.stopPropagation()}
                />
                <StyledRelationLabel>{relation.fieldLabel}</StyledRelationLabel>
                <StyledSubFieldCount>
                  {noneSelected
                    ? t`excluded`
                    : `${selectedCount} / ${totalCount}`}
                </StyledSubFieldCount>
                {isExpanded ? (
                  <IconChevronDown size={14} />
                ) : (
                  <IconChevronRight size={14} />
                )}
              </StyledRelationHeader>
              {isExpanded && (
                <StyledSubFieldList>
                  {relation.exportableSubFields.map((subField) => (
                    <MenuItemMultiSelect
                      key={subField.fieldName}
                      text={subField.fieldLabel}
                      selected={
                        selections[relation.fieldName]?.has(
                          subField.fieldName,
                        ) ?? false
                      }
                      className=""
                      onSelectChange={() =>
                        toggleSubField(relation.fieldName, subField.fieldName)
                      }
                    />
                  ))}
                </StyledSubFieldList>
              )}
            </StyledRelationSection>
          );
        })}
      </StyledModalContent>
      <StyledFooter>
        <Button title={t`Cancel`} variant="secondary" onClick={handleCancel} />
        <Button
          title={t`Export (${totalSelected} extra fields)`}
          variant="primary"
          accent="blue"
          onClick={handleExport}
        />
      </StyledFooter>
    </ModalStatefulWrapper>
  );
};
