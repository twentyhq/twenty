import { ApplicationStackIcon } from '@/applications/components/ApplicationStackIcon';
import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isAdvancedRelationFieldMetadataItem } from '@/object-record/utils/isAdvancedRelationFieldMetadataItem';
import { isFieldWidgetEligibleNestedParentField } from '@/page-layout/widgets/field/utils/isFieldWidgetEligibleNestedParentField';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { useResolveFieldWidgetRelationTableViewIdChange } from '@/page-layout/widgets/record-table/hooks/useResolveFieldWidgetRelationTableViewIdChange';
import { useFieldWidgetEligibleFields } from '@/page-layout/widgets/field/hooks/useFieldWidgetEligibleFields';
import { getFieldWidgetEligibleNestedFields } from '@/page-layout/widgets/field/utils/getFieldWidgetEligibleNestedFields';
import {
  getFieldWidgetDefaultDisplayMode,
  isDisplayModeValidForFieldType,
} from '@/page-layout/widgets/field/utils/getFieldWidgetDisplayModeConfig';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { FieldWidgetNestedFieldDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/FieldWidgetNestedFieldDropdownContent';
import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { Dropdown } from 'twenty-ui/components/navigation';
import { FieldDisplayMode } from '~/generated-metadata/graphql';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type FieldWidgetFieldSelectionRow =
  | { type: 'navigation'; fieldMetadataItem: FieldMetadataItem }
  | { type: 'options'; fieldMetadataItems: FieldMetadataItem[] };

export const FieldWidgetFieldDropdownContent = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { pageLayoutId, targetRecordIdentifier } =
    usePageLayoutSidePanelTarget();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const fieldConfiguration = widgetInEditMode?.configuration as
    | FieldConfiguration
    | undefined;

  const currentFieldMetadataId = fieldConfiguration?.fieldMetadataId;
  const currentNestedRelationFieldMetadataId =
    fieldConfiguration?.nestedRelationFieldMetadataId;

  const allFieldWidgetFieldMetadataItems = useFieldWidgetEligibleFields(
    targetRecordIdentifier.targetObjectNameSingular,
  );

  const { objectMetadataItems } = useObjectMetadataItems();

  const regularFieldMetadataItems: FieldMetadataItem[] = [];
  const advancedFieldMetadataItems: FieldMetadataItem[] = [];

  for (const fieldMetadataItem of allFieldWidgetFieldMetadataItems) {
    const isAdvancedField = isAdvancedRelationFieldMetadataItem(
      fieldMetadataItem,
      objectMetadataItems,
    );

    if (isAdvancedField) {
      advancedFieldMetadataItems.push(fieldMetadataItem);
      continue;
    }

    regularFieldMetadataItems.push(fieldMetadataItem);
  }

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  const { resolveFieldWidgetRelationTableViewIdChange } =
    useResolveFieldWidgetRelationTableViewIdChange(pageLayoutId);

  const { getIcon } = useIcons();

  const searchableFieldMetadataItems = [
    ...regularFieldMetadataItems,
    ...advancedFieldMetadataItems,
  ];

  const availableFields = filterBySearchQuery({
    items: searchableFieldMetadataItems,
    searchQuery,
    getSearchableValues: (item) => [item.label],
  });

  const { fieldMetadataItem: currentFieldMetadataItem } =
    useFieldMetadataItemById(currentFieldMetadataId ?? '');

  const nestedFieldCandidatesByFieldId = useMemo(() => {
    const candidatesByFieldId = new Map<string, FieldMetadataItem[]>();

    for (const fieldMetadataItem of allFieldWidgetFieldMetadataItems) {
      if (!isFieldWidgetEligibleNestedParentField(fieldMetadataItem)) {
        continue;
      }

      const relationTargetObjectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id ===
          fieldMetadataItem.relation?.targetObjectMetadata.id,
      );

      if (!isDefined(relationTargetObjectMetadataItem)) {
        continue;
      }

      const nestedFieldCandidates = getFieldWidgetEligibleNestedFields(
        relationTargetObjectMetadataItem,
      );

      if (isNonEmptyArray(nestedFieldCandidates)) {
        candidatesByFieldId.set(fieldMetadataItem.id, nestedFieldCandidates);
      }
    }

    return candidatesByFieldId;
  }, [allFieldWidgetFieldMetadataItems, objectMetadataItems]);

  const isSelectingDifferentChain = ({
    fieldMetadataId,
    nestedRelationFieldMetadataId,
  }: {
    fieldMetadataId: string;
    nestedRelationFieldMetadataId: string | null;
  }) =>
    currentFieldMetadataId !== fieldMetadataId ||
    (currentNestedRelationFieldMetadataId ?? null) !==
      nestedRelationFieldMetadataId;

  const handleSelectField = (selectedField: FieldMetadataItem) => {
    const currentDisplayMode = fieldConfiguration?.fieldDisplayMode;

    const needsDisplayModeSwitch =
      isDefined(currentDisplayMode) &&
      !isDisplayModeValidForFieldType(
        selectedField.type,
        currentDisplayMode,
        selectedField.relation?.type,
      );

    const nextDisplayMode = needsDisplayModeSwitch
      ? getFieldWidgetDefaultDisplayMode(selectedField.type)
      : currentDisplayMode;

    const relationTableViewIdChange =
      resolveFieldWidgetRelationTableViewIdChange({
        selectedField,
        nextDisplayMode,
        isSelectingDifferentChain: isSelectingDifferentChain({
          fieldMetadataId: selectedField.id,
          nestedRelationFieldMetadataId: null,
        }),
        widgetId: widgetInEditMode?.id,
        currentViewId: fieldConfiguration?.viewId,
      });

    updateCurrentWidgetConfig({
      configToUpdate: {
        fieldMetadataId: selectedField.id,
        nestedRelationFieldMetadataId: null,
        ...relationTableViewIdChange,
        ...(needsDisplayModeSwitch && {
          fieldDisplayMode: nextDisplayMode,
        }),
      },
    });

    if (isDefined(widgetInEditMode)) {
      updatePageLayoutWidget(widgetInEditMode.id, {
        title: selectedField.label,
      });
    }
  };

  const handleSelectNestedField = ({
    parentFieldMetadataItem,
    nestedFieldMetadataItem,
  }: {
    parentFieldMetadataItem: FieldMetadataItem;
    nestedFieldMetadataItem: FieldMetadataItem;
  }) => {
    const relationTableViewIdChange =
      resolveFieldWidgetRelationTableViewIdChange({
        selectedField: parentFieldMetadataItem,
        selectedNestedField: nestedFieldMetadataItem,
        nextDisplayMode: FieldDisplayMode.TABLE,
        isSelectingDifferentChain: isSelectingDifferentChain({
          fieldMetadataId: parentFieldMetadataItem.id,
          nestedRelationFieldMetadataId: nestedFieldMetadataItem.id,
        }),
        widgetId: widgetInEditMode?.id,
        currentViewId: fieldConfiguration?.viewId,
      });

    updateCurrentWidgetConfig({
      configToUpdate: {
        fieldMetadataId: parentFieldMetadataItem.id,
        nestedRelationFieldMetadataId: nestedFieldMetadataItem.id,
        fieldDisplayMode: FieldDisplayMode.TABLE,
        ...relationTableViewIdChange,
      },
    });

    if (isDefined(widgetInEditMode)) {
      updatePageLayoutWidget(widgetInEditMode.id, {
        title: `${parentFieldMetadataItem.label} → ${nestedFieldMetadataItem.label}`,
      });
    }
  };

  const fieldSelectionRows: FieldWidgetFieldSelectionRow[] = [];

  for (const fieldMetadataItem of availableFields) {
    if (nestedFieldCandidatesByFieldId.has(fieldMetadataItem.id)) {
      fieldSelectionRows.push({ type: 'navigation', fieldMetadataItem });
      continue;
    }

    const previousRow = fieldSelectionRows.at(-1);

    if (previousRow?.type === 'options') {
      previousRow.fieldMetadataItems.push(fieldMetadataItem);
      continue;
    }

    fieldSelectionRows.push({
      type: 'options',
      fieldMetadataItems: [fieldMetadataItem],
    });
  }

  const renderFieldIcon = (fieldMetadataItem: FieldMetadataItem) => (
    <ApplicationStackIcon
      Icon={getIcon(
        currentFieldMetadataId === fieldMetadataItem.id
          ? currentFieldMetadataItem?.icon
          : fieldMetadataItem.icon,
      )}
      applicationId={fieldMetadataItem.applicationId}
    />
  );

  return (
    <>
      <Dropdown.Page id="root">
        <Dropdown.Search
          placeholder={t`Search fields`}
          aria-label={t`Search fields`}
          onValueChange={setSearchQuery}
          value={searchQuery}
        />
        <Dropdown.Separator />
        <ChartSettingsDropdownSection>
          {fieldSelectionRows.map((row) => {
            if (row.type === 'navigation') {
              return (
                <Dropdown.ActionItem
                  key={row.fieldMetadataItem.id}
                  page={row.fieldMetadataItem.id}
                  startIcon={renderFieldIcon(row.fieldMetadataItem)}
                >
                  {row.fieldMetadataItem.label}
                </Dropdown.ActionItem>
              );
            }

            return (
              <Dropdown.SelectionGroup
                key={row.fieldMetadataItems[0].id}
                value={currentFieldMetadataId ?? null}
                aria-label={t`Fields`}
              >
                {row.fieldMetadataItems.map((fieldMetadataItem) => (
                  <Dropdown.OptionItem
                    key={fieldMetadataItem.id}
                    value={fieldMetadataItem.id}
                    onSelect={() => handleSelectField(fieldMetadataItem)}
                    startIcon={renderFieldIcon(fieldMetadataItem)}
                  >
                    {fieldMetadataItem.label}
                  </Dropdown.OptionItem>
                ))}
              </Dropdown.SelectionGroup>
            );
          })}
          {!isNonEmptyArray(availableFields) && (
            <Dropdown.Empty>{t`No fields available`}</Dropdown.Empty>
          )}
        </ChartSettingsDropdownSection>
      </Dropdown.Page>
      {allFieldWidgetFieldMetadataItems.map((fieldMetadataItem) => {
        const nestedFieldCandidates = nestedFieldCandidatesByFieldId.get(
          fieldMetadataItem.id,
        );

        if (!isDefined(nestedFieldCandidates)) {
          return null;
        }

        return (
          <FieldWidgetNestedFieldDropdownContent
            key={fieldMetadataItem.id}
            drillInFieldMetadataItem={fieldMetadataItem}
            nestedFieldCandidates={nestedFieldCandidates}
            checkedItemId={
              currentFieldMetadataId === fieldMetadataItem.id
                ? (currentNestedRelationFieldMetadataId ?? fieldMetadataItem.id)
                : undefined
            }
            onSelectField={handleSelectField}
            onSelectNestedField={handleSelectNestedField}
          />
        );
      })}
    </>
  );
};
