import { TextInput } from '@/ui/input/components/TextInput';
import { useLingui } from '@lingui/react/macro';
import {
  IconArrowLeft,
  IconDatabase,
  IconEye,
  IconInfoCircle,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';
import {
  StyledColumnInfo,
  StyledColumnMappingGrid,
  StyledColumnMappingRow,
  StyledColumnName,
  StyledColumnSample,
  StyledFormError,
  StyledFormField,
  StyledFormLabel,
  StyledFormRow,
  StyledImportSettingsContainer,
  StyledImportStats,
  StyledInfoBox,
  StyledInfoContent,
  StyledInfoDescription,
  StyledInfoTitle,
  StyledNavigationButtons,
  StyledObjectConfigurationSection,
  StyledStatItem,
  StyledStatLabel,
  StyledStatNumber,
} from '../SettingsImport.styles';
import { ColumnMapping } from '../types/ColumnMapping';
import { ColumnMappingValue } from '../types/ColumnMappingValue';
import { CsvColumn } from '../types/CsvColumn';
import { ObjectConfiguration } from '../types/ObjectConfiguration';

import { isReservedFieldName } from '../utils/field.utils';
import { Heading } from './Heading';
import { IconSelector } from './IconSelector';
import { TypeSelector } from './TypeSelector';

export const ImportSettingsStep = ({
  csvColumns,
  columnMappings,
  onColumnMappingChange,
  objectConfig,
  onObjectConfigChange,
  onBack,
  onNext,
}: {
  csvColumns: CsvColumn[];
  columnMappings: ColumnMapping;
  onColumnMappingChange: (mappings: ColumnMapping) => void;
  objectConfig: ObjectConfiguration;
  onObjectConfigChange: (config: ObjectConfiguration) => void;
  onBack: () => void;
  onNext: () => void;
}) => {
  const { t } = useLingui();
  const handleMappingChange = (
    columnName: string,
    mapping: ColumnMappingValue,
  ) => onColumnMappingChange({ ...columnMappings, [columnName]: mapping });
  const handleConfigChange = (
    field: keyof ObjectConfiguration,
    value: string,
  ) => onObjectConfigChange({ ...objectConfig, [field]: value });

  const fieldsToImportCount = Object.values(columnMappings).filter(
    (m) => m.type !== 'DO_NOT_IMPORT',
  ).length;

  const hasInvalidMappings = csvColumns.some((col) => {
    const m = columnMappings[col.name];
    return (
      m &&
      m.type !== 'DO_NOT_IMPORT' &&
      isReservedFieldName(computeMetadataNameFromLabel(col.name))
    );
  });

  const areNamesIdentical =
    objectConfig.nameSingular.trim() !== '' &&
    objectConfig.nameSingular.trim().toLowerCase() ===
      objectConfig.namePlural.trim().toLowerCase();

  const isFormValid =
    objectConfig.nameSingular.trim() &&
    objectConfig.namePlural.trim() &&
    objectConfig.icon &&
    !areNamesIdentical &&
    fieldsToImportCount > 0 &&
    !hasInvalidMappings;

  return (
    <StyledImportSettingsContainer>
      <Heading
        title={t({
          id: 'importSettings.title',
          message: 'Configure Import Settings',
        })}
        description={t({
          id: 'importSettings.description',
          message: 'Set up your new object and map the columns to field types.',
        })}
      />

      <StyledObjectConfigurationSection>
        <StyledFormRow>
          <StyledFormField>
            <StyledFormLabel htmlFor="singularName">
              {t({
                id: 'importSettings.singularName',
                message: 'Singular Name',
              })}
            </StyledFormLabel>
            <TextInput
              id="singularName"
              placeholder={t({
                id: 'importSettings.singularName.placeholder',
                message: 'e.g., Client',
              })}
              value={objectConfig.nameSingular}
              onChange={(v) => handleConfigChange('nameSingular', v)}
              fullWidth
            />
          </StyledFormField>
          <StyledFormField>
            <StyledFormLabel htmlFor="pluralName">
              {t({ id: 'importSettings.pluralName', message: 'Plural Name' })}
            </StyledFormLabel>
            <TextInput
              id="pluralName"
              placeholder={t({
                id: 'importSettings.pluralName.placeholder',
                message: 'e.g., Clients',
              })}
              value={objectConfig.namePlural}
              onChange={(v) => handleConfigChange('namePlural', v)}
              fullWidth
            />
          </StyledFormField>
        </StyledFormRow>
        {areNamesIdentical && (
          <StyledFormError>
            {t`Singular and plural names must be different.`}
          </StyledFormError>
        )}
        <StyledFormRow>
          <StyledFormField>
            <StyledFormLabel>
              {t({ id: 'importSettings.icon', message: 'Icon' })}
            </StyledFormLabel>
            <IconSelector
              selectedIcon={objectConfig.icon}
              onIconChange={(icon) => handleConfigChange('icon', icon)}
            />
          </StyledFormField>
        </StyledFormRow>
        <StyledFormField>
          <StyledFormLabel htmlFor="description">
            {t({
              id: 'importSettings.descriptionField',
              message: 'Description (Optional)',
            })}
          </StyledFormLabel>
          <TextInput
            id="description"
            placeholder={t({
              id: 'importSettings.description.placeholder',
              message: 'Brief description (e.g., "A client of the company")',
            })}
            value={objectConfig.description}
            onChange={(v) => handleConfigChange('description', v)}
            fullWidth
          />
        </StyledFormField>
      </StyledObjectConfigurationSection>

      <StyledInfoBox>
        <IconInfoCircle size={20} />
        <StyledInfoContent>
          <StyledInfoTitle>
            {t({
              id: 'importSettings.fieldTypeMapping.title',
              message: 'Field Type Mapping',
            })}
          </StyledInfoTitle>
          <StyledInfoDescription>
            {t({
              id: 'importSettings.fieldTypeMapping.description',
              message:
                'Select a data type for each column. Choose "Do not import" to skip a column. For composite types, select the appropriate subfield.',
            })}
          </StyledInfoDescription>
        </StyledInfoContent>
      </StyledInfoBox>

      <StyledImportStats>
        <StyledStatItem>
          <IconEye size={16} />
          <StyledStatNumber>{fieldsToImportCount}</StyledStatNumber>
          <StyledStatLabel>
            {t({
              id: 'importSettings.fieldsToImportStat',
              message: 'fields to import',
            })}
          </StyledStatLabel>
        </StyledStatItem>
      </StyledImportStats>

      <StyledColumnMappingGrid>
        {csvColumns.map((column) => {
          const currentMapping = columnMappings[column.name] || {
            type: 'DO_NOT_IMPORT',
          };
          const isIgnored = currentMapping.type === 'DO_NOT_IMPORT';
          const isReserved = isReservedFieldName(
            computeMetadataNameFromLabel(column.name),
          );
          const sampleDisplay =
            column.sampleData.slice(0, 2).join(', ') +
            (column.sampleData.length > 2 ? '...' : '');
          return (
            <StyledColumnMappingRow key={column.name} isIgnored={isIgnored}>
              <StyledColumnInfo>
                <StyledColumnName isIgnored={isIgnored}>
                  {column.name}
                  {isReserved && !isIgnored && (
                    <span
                      title={t({
                        id: 'importSettings.reservedWarningTooltip',
                        message: 'Reserved name',
                      })}
                    >
                      {' '}
                      ⚠️
                    </span>
                  )}
                </StyledColumnName>
                <StyledColumnSample isIgnored={isIgnored}>
                  {isIgnored
                    ? t({
                        id: 'importSettings.columnSkipped',
                        message: 'Column will be skipped.',
                      })
                    : `${t({ id: 'importSettings.sampleDataPrefix', message: 'Sample:' })} ${sampleDisplay || t({ id: 'importSettings.noSampleData', message: 'N/A' })}`}
                </StyledColumnSample>
              </StyledColumnInfo>
              <TypeSelector
                selectedMapping={currentMapping}
                onMappingChange={(m) => handleMappingChange(column.name, m)}
                columnName={column.name}
              />
            </StyledColumnMappingRow>
          );
        })}
      </StyledColumnMappingGrid>

      <StyledNavigationButtons>
        <Button
          Icon={IconArrowLeft}
          title={t({
            id: 'importSettings.back',
            message: 'Cancel and Return to Upload',
          })}
          variant="secondary"
          onClick={onBack}
        />
        <Button
          Icon={IconDatabase}
          title={t({
            id: 'importSettings.next',
            message: 'Create Object & Fields',
          })}
          accent="blue"
          onClick={onNext}
          disabled={!isFormValid}
        />
      </StyledNavigationButtons>
    </StyledImportSettingsContainer>
  );
};
