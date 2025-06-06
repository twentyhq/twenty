import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useCombinedGetTotalCount } from '@/object-record/multiple-objects/hooks/useCombinedGetTotalCount';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useMemo, useState } from 'react';
import { H2Title, IconArrowRight, IconSearch } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

import { EXPORT_TABLE_METADATA } from './constants/exportTableMetadata';
import { useMultipleObjectExport } from './hooks/useMultipleObjectExport';
import type { ExportFormat } from './types/exportFormat';
import type { ExportStep } from './types/exportStep';
import { createExportItems } from './utils/createExportItems';
import { filterItems } from './utils/filterItems';
import { ExportProgressModal } from './components/ExportProgressModal';
import { FormatSelectionStep } from './components/FormatSelectionStep';
import { ObjectSelectionTable } from './components/ObjectSelectionTable';
import {
  StyledActionButton,
  StyledContinueButtonContainer,
  StyledObjectExportTableRow,
  StyledSearchInput,
  StyledTableContainer,
  StyledTableHeaderCell,
} from './components/SettingsExport.styles';
import { TypePreservationStep } from './components/TypePreservationStep';

export const SettingsExport = () => {
  const { t } = useLingui();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(
    new Set(),
  );
  const [currentStep, setCurrentStep] = useState<ExportStep>('select-objects');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [preserveTypes, setPreserveTypes] = useState<boolean>(true);

  const { exportObjects, isExporting, exportProgress } =
    useMultipleObjectExport();

  const {
    activeNonSystemObjectMetadataItems,
    inactiveNonSystemObjectMetadataItems,
  } = useFilteredObjectMetadataItems();
  const { totalCountByObjectMetadataItemNamePlural } = useCombinedGetTotalCount(
    {
      objectMetadataItems: [
        ...activeNonSystemObjectMetadataItems,
        ...inactiveNonSystemObjectMetadataItems,
      ],
    },
  );

  const safeTotalCounts = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(totalCountByObjectMetadataItemNamePlural).map(
          ([key, value]) => [key, value ?? 0],
        ),
      ) as Record<string, number>,
    [totalCountByObjectMetadataItemNamePlural],
  );

  const { activeExportItems, inactiveExportItems } = useMemo(
    () => ({
      activeExportItems: createExportItems(
        activeNonSystemObjectMetadataItems,
        safeTotalCounts,
      ),
      inactiveExportItems: createExportItems(
        inactiveNonSystemObjectMetadataItems,
        safeTotalCounts,
      ),
    }),
    [
      activeNonSystemObjectMetadataItems,
      inactiveNonSystemObjectMetadataItems,
      safeTotalCounts,
    ],
  );

  const sortedActiveItems = useSortedArray(
    activeExportItems,
    EXPORT_TABLE_METADATA,
  );
  const sortedInactiveItems = useSortedArray(
    inactiveExportItems,
    EXPORT_TABLE_METADATA,
  );

  const filteredActiveItems = useMemo(
    () => filterItems(sortedActiveItems, searchTerm),
    [sortedActiveItems, searchTerm],
  );
  const filteredInactiveItems = useMemo(
    () => filterItems(sortedInactiveItems, searchTerm),
    [sortedInactiveItems, searchTerm],
  );

  const selectionState = useMemo(() => {
    const allActiveSelected =
      filteredActiveItems.length > 0 &&
      filteredActiveItems.every((item) => selectedObjects.has(item.id));
    const allInactiveSelected =
      filteredInactiveItems.length > 0 &&
      filteredInactiveItems.every((item) => selectedObjects.has(item.id));
    return {
      allActiveSelected,
      allInactiveSelected,
      someActiveSelected:
        filteredActiveItems.some((item) => selectedObjects.has(item.id)) &&
        !allActiveSelected,
      someInactiveSelected:
        filteredInactiveItems.some((item) => selectedObjects.has(item.id)) &&
        !allInactiveSelected,
      selectedCount: selectedObjects.size,
    };
  }, [filteredActiveItems, filteredInactiveItems, selectedObjects]);

  const handleSelectObject = useCallback(
    (objectId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedObjects((prev) => {
        const newSet = new Set(prev);
        event.target.checked ? newSet.add(objectId) : newSet.delete(objectId);
        return newSet;
      });
    },
    [],
  );

  const handleSelectAllItems = useCallback(
    (items: typeof activeExportItems) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedObjects((prev) => {
          const newSet = new Set(prev);
          items.forEach((item) =>
            event.target.checked ? newSet.add(item.id) : newSet.delete(item.id),
          );
          return newSet;
        });
      },
    [],
  );

  const resetToInitialState = () => {
    setSelectedObjects(new Set());
    setCurrentStep('select-objects');
    setSelectedFormat('csv');
    setPreserveTypes(true);
    setSearchTerm('');
  };

  const handleExport = useCallback(async () => {
    const selectedItems = [...activeExportItems, ...inactiveExportItems].filter(
      (item) => selectedObjects.has(item.id),
    );
    const allMetadataItems = [
      ...activeNonSystemObjectMetadataItems,
      ...inactiveNonSystemObjectMetadataItems,
    ];
    await exportObjects(
      selectedItems,
      allMetadataItems,
      selectedFormat,
      preserveTypes,
    );
    resetToInitialState();
  }, [
    activeExportItems,
    inactiveExportItems,
    selectedObjects,
    activeNonSystemObjectMetadataItems,
    inactiveNonSystemObjectMetadataItems,
    selectedFormat,
    preserveTypes,
    exportObjects,
  ]);

  return (
    <>
      <SubMenuTopBarContainer
        title={t`Export Data`}
        links={[
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          { children: t`Export` },
        ]}
      >
        <SettingsPageContainer>
          <Section>
            {currentStep === 'select-objects' && (
              <>
                <H2Title
                  title={t`Select Objects to Export`}
                  description={t`Select the objects you want to export from your workspace`}
                />
                <StyledSearchInput
                  LeftIcon={IconSearch}
                  placeholder={t`Search for an object...`}
                  value={searchTerm}
                  onChange={setSearchTerm}
                />
                <StyledTableContainer>
                  <Table>
                    <StyledObjectExportTableRow>
                      <StyledTableHeaderCell>{t`Select`}</StyledTableHeaderCell>
                      {EXPORT_TABLE_METADATA.fields.map((field) => (
                        <SortableTableHeader
                          key={field.fieldName}
                          fieldName={field.fieldName}
                          label={t(field.fieldLabel)}
                          tableId={EXPORT_TABLE_METADATA.tableId}
                          align={field.align}
                          initialSort={EXPORT_TABLE_METADATA.initialSort}
                        />
                      ))}
                    </StyledObjectExportTableRow>
                    <ObjectSelectionTable
                      items={filteredActiveItems}
                      title={t`Active Objects`}
                      selectedObjects={selectedObjects}
                      onSelectObject={handleSelectObject}
                      onSelectAll={handleSelectAllItems(filteredActiveItems)}
                      allSelected={selectionState.allActiveSelected}
                      someSelected={selectionState.someActiveSelected}
                    />
                    <ObjectSelectionTable
                      items={filteredInactiveItems}
                      title={t`Inactive Objects`}
                      selectedObjects={selectedObjects}
                      onSelectObject={handleSelectObject}
                      onSelectAll={handleSelectAllItems(filteredInactiveItems)}
                      allSelected={selectionState.allInactiveSelected}
                      someSelected={selectionState.someInactiveSelected}
                    />
                  </Table>
                </StyledTableContainer>
                <StyledContinueButtonContainer>
                  <StyledActionButton
                    Icon={IconArrowRight}
                    title={t`Continue (${selectionState.selectedCount} selected)`}
                    accent="blue"
                    size="medium"
                    disabled={selectionState.selectedCount === 0}
                    onClick={() => setCurrentStep('select-format')}
                  />
                </StyledContinueButtonContainer>
              </>
            )}
            {currentStep === 'select-format' && (
              <FormatSelectionStep
                selectedFormat={selectedFormat}
                onFormatChange={setSelectedFormat}
                onBack={() => setCurrentStep('select-objects')}
                onNext={() => setCurrentStep('preserve-types')}
                onExport={handleExport}
                selectedCount={selectionState.selectedCount}
              />
            )}
            {currentStep === 'preserve-types' && (
              <TypePreservationStep
                preserveTypes={preserveTypes}
                onPreserveTypesChange={setPreserveTypes}
                onBack={() => setCurrentStep('select-format')}
                onExport={handleExport}
                selectedCount={selectionState.selectedCount}
              />
            )}
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
      <ExportProgressModal isVisible={isExporting} progress={exportProgress} />
    </>
  );
};
