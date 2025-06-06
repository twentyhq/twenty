import { useCreateOneObjectMetadataItem } from '@/object-metadata/hooks/useCreateOneObjectMetadataItem';
import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { SettingsDataModelObjectAboutFormValues } from '@/settings/data-model/validation-schemas/settingsDataModelObjectAboutFormSchema';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import {
  IconArrowLeft,
  IconDatabase,
  IconInfoCircle,
  IconSettings,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';
import { ColumnMapping } from '~/pages/settings/import/types/ColumnMapping';
import { FieldCreationResult } from '~/pages/settings/import/types/FieldCreationResult';
import { ImportSession } from '~/pages/settings/import/types/ImportSession';
import { ObjectConfiguration } from '~/pages/settings/import/types/ObjectConfiguration';

import { FIELD_TYPE_MAPPING } from '../constants/fieldTypeMapping';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '../constants/settingsFieldType';
import {
  StyledCreateObjectContainer,
  StyledImportStats,
  StyledInfoBox,
  StyledInfoContent,
  StyledInfoDescription,
  StyledInfoTitle,
  StyledLoadingCard,
  StyledLoadingIcon,
  StyledLoadingText,
  StyledNavigationButtons,
  StyledStatItem,
  StyledStatLabel,
  StyledStatNumber,
} from '../SettingsImport.styles';

import {
  generateUniqueFieldName,
  getDefaultIconForType,
  isCompositeType,
  parseErrorMessage,
} from '../utils/field.utils';
import { capitalizeFirst } from '../utils/format.utils';
import { Heading } from './Heading';

const createObjectAndFields = async (
  objectConfig: ObjectConfiguration,
  columnMappings: ColumnMapping,
  createOneObjectMetadataItem: (input: any) => Promise<any>,
  createMetadataField: (input: any) => Promise<any>,
  enqueueSnackBar: (message: string, options: { variant: any }) => void,
  t: (
    key: { id: string; message: string },
    params?: Record<string, any>,
  ) => string,
): Promise<{
  objectId: string;
  objectNameSingular: string;
  fields: FieldCreationResult[];
}> => {
  // 1. Criar o objeto
  const formValues: SettingsDataModelObjectAboutFormValues = {
    nameSingular: computeMetadataNameFromLabel(objectConfig.nameSingular),
    namePlural: computeMetadataNameFromLabel(objectConfig.namePlural),
    labelSingular: capitalizeFirst(objectConfig.nameSingular),
    labelPlural: capitalizeFirst(objectConfig.namePlural),
    description: objectConfig.description || null,
    icon: objectConfig.icon,
    isLabelSyncedWithName: true,
  };

  const { data: response } = await createOneObjectMetadataItem(formValues);
  if (!response?.createOneObject) {
    throw new Error('Failed to create object');
  }

  const createdObject = response.createOneObject;

  enqueueSnackBar(
    t(
      {
        id: 'import.success.objectCreated',
        message: 'Object "{label}" created!',
      },
      { label: createdObject.labelSingular },
    ),
    { variant: SnackBarVariant.Success },
  );

  // 2. Criar os campos
  const fieldsToCreate = Object.entries(columnMappings);
  const results: FieldCreationResult[] = [];
  const createdFieldNames: string[] = [];

  for (const [columnName, mapping] of fieldsToCreate) {
    try {
      const baseFieldName = computeMetadataNameFromLabel(columnName);
      const fieldLabel = columnName;
      const fieldType = FIELD_TYPE_MAPPING[mapping.type as string];

      if (mapping.type === 'DO_NOT_IMPORT') {
        continue;
      }
      if (!fieldType) {
        results.push({
          success: false,
          fieldName: baseFieldName,
          columnName,
          error: `Unknown field type: ${mapping.type}`,
        });
        continue;
      }

      const uniqueFieldName = generateUniqueFieldName(
        columnName,
        createdFieldNames,
      );
      createdFieldNames.push(uniqueFieldName);

      const fieldInput: any = {
        objectMetadataId: createdObject.id,
        name: uniqueFieldName,
        label: fieldLabel,
        type: fieldType,
        icon: getDefaultIconForType(mapping.type),
        description: `Field imported from column: ${columnName}`,
        isLabelSyncedWithName: false,
        defaultValue: null,
        options: null,
        settings: null,
      };

      if (isCompositeType(mapping.type) && mapping.subType !== undefined) {
        const subFieldLabelPart =
          SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[mapping.type]
            ?.labelBySubField?.[
            mapping.subType as keyof (typeof SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS)[typeof mapping.type]['labelBySubField']
          ] || mapping.subType;
        fieldInput.name = `${uniqueFieldName}_${mapping.subType}`;
        fieldInput.label = `${fieldLabel} - ${subFieldLabelPart}`;
      }
      if (mapping.type === 'SELECT' || mapping.type === 'MULTI_SELECT') {
        fieldInput.options = [];
      }

      const result = await createMetadataField(fieldInput);
      if (result?.data?.createOneField !== undefined) {
        results.push({
          success: true,
          fieldName: fieldInput.name,
          columnName,
          field: result.data.createOneField,
        });
      } else {
        const errorMsg =
          result?.errors?.[0]?.message || 'Unknown field creation error';
        //todo
        results.push({
          success: false,
          fieldName: fieldInput.name,
          columnName,
          error: parseErrorMessage(errorMsg),
        });
      }
    } catch (fieldError: any) {
      //todo
      results.push({
        success: false,
        fieldName: computeMetadataNameFromLabel(columnName),
        columnName,
        error: parseErrorMessage(fieldError),
      });
    }
  }

  const successfulFields = results.filter((r) => r.success);
  const failedFields = results.filter((r) => !r.success);

  failedFields.forEach((res) =>
    enqueueSnackBar(
      t(
        {
          id: 'fieldCreationError',
          message: 'Error creating field for column {columnName}: {error}',
        },
        {
          columnName: res.columnName,
          error: res.error,
        },
      ),
      { variant: SnackBarVariant.Warning },
    ),
  );

  if (successfulFields.length > 0) {
    enqueueSnackBar(
      failedFields.length === 0
        ? t(
            {
              id: 'allFieldsCreatedSuccess',
              message: 'Successfully created {count} fields',
            },
            { count: successfulFields.length },
          )
        : t(
            {
              id: 'partialFieldsCreatedSuccess',
              message: 'Created {successCount} fields, {failCount} failed',
            },
            {
              successCount: successfulFields.length,
              failCount: failedFields.length,
            },
          ),
      { variant: SnackBarVariant.Success },
    );
  }

  return {
    objectId: createdObject.id,
    objectNameSingular: formValues.nameSingular,
    fields: successfulFields,
  };
};

export const CreateObjectStep = ({
  objectConfig,
  columnMappings,
  onNext,
  onBack,
  onFailure,
  isCreating,
  setIsCreating,
}: {
  objectConfig: ObjectConfiguration;
  columnMappings: ColumnMapping;
  onNext: (session: ImportSession) => void;
  onBack: () => void;
  onFailure: (status: 'failed', message: string) => void;
  isCreating: boolean;
  setIsCreating: (creating: boolean) => void;
}) => {
  const { t } = useLingui();
  const { enqueueSnackBar } = useSnackBar();
  const { createOneObjectMetadataItem } = useCreateOneObjectMetadataItem();
  const { createMetadataField } = useFieldMetadataItem();

  const handleCreateObject = async () => {
    setIsCreating(true);
    try {
      const filteredColumnMappings = Object.fromEntries(
        Object.entries(columnMappings).filter(
          ([, m]) => m.type !== 'DO_NOT_IMPORT',
        ),
      );
      const result = await createObjectAndFields(
        objectConfig,
        filteredColumnMappings,
        createOneObjectMetadataItem,
        createMetadataField,
        enqueueSnackBar,
        t,
      );

      await new Promise((resolve) => setTimeout(resolve, 8000));

      const session: ImportSession = {
        objectId: result.objectId,
        objectNameSingular: result.objectNameSingular,
        fields: result.fields,
        csvRows: [], // Will be populated in the next step
        isNewObject: true,
      };

      onNext(session);
    } catch (error: any) {
      const errorMessage = parseErrorMessage(error);
      onFailure('failed', `Failed to create object: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  const fieldsToCreate = Object.values(columnMappings).filter(
    (m) => m.type !== 'DO_NOT_IMPORT',
  ).length;

  const nameSingular = objectConfig.nameSingular;
  return (
    <StyledCreateObjectContainer>
      <Heading
        title={t({
          id: 'createObject.title',
          message: 'Create Object & Fields',
        })}
        description={t({
          id: 'createObject.description',
          message: 'Creating the object structure before importing data.',
        })}
      />

      {isCreating ? (
        <StyledLoadingCard>
          <StyledLoadingIcon>
            <IconDatabase size={20} />
          </StyledLoadingIcon>
          <StyledLoadingText>
            {t({
              id: 'createObject.creating',
              message: 'Creating object and fields...',
            })}
          </StyledLoadingText>
        </StyledLoadingCard>
      ) : (
        <StyledInfoBox>
          <IconInfoCircle size={20} />
          <StyledInfoContent>
            <StyledInfoTitle>
              {t({
                id: 'createObject.info.title',
                message: 'Ready to Create',
              })}
            </StyledInfoTitle>
            <StyledInfoDescription>
              {t`Will create object "${nameSingular}" with ${fieldsToCreate} fields.`}
            </StyledInfoDescription>
          </StyledInfoContent>
        </StyledInfoBox>
      )}

      <StyledImportStats>
        <StyledStatItem>
          <IconDatabase size={16} />
          <StyledStatNumber>1</StyledStatNumber>
          <StyledStatLabel>
            {t({
              id: 'createObject.objectStat',
              message: 'object to create',
            })}
          </StyledStatLabel>
        </StyledStatItem>
        <StyledStatItem>
          <IconSettings size={16} />
          <StyledStatNumber>{fieldsToCreate}</StyledStatNumber>
          <StyledStatLabel>
            {t({
              id: 'createObject.fieldsStat',
              message: 'fields to create',
            })}
          </StyledStatLabel>
        </StyledStatItem>
      </StyledImportStats>

      <StyledNavigationButtons>
        <Button
          Icon={IconArrowLeft}
          title={t({ id: 'createObject.back', message: 'Back to Settings' })}
          variant="secondary"
          onClick={onBack}
          disabled={isCreating}
        />
        <Button
          Icon={IconDatabase}
          title={
            isCreating
              ? t({ id: 'createObject.creating', message: 'Creating...' })
              : t({
                  id: 'createObject.create',
                  message: 'Create Object & Fields',
                })
          }
          accent="blue"
          onClick={handleCreateObject}
          disabled={isCreating}
        />
      </StyledNavigationButtons>
    </StyledCreateObjectContainer>
  );
};
