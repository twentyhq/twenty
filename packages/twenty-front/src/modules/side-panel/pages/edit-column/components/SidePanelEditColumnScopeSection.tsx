import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { filterSortableFieldMetadataItems } from '@/object-metadata/utils/filterSortableFieldMetadataItems';
import { AdvancedFilterSidePanelContainer } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelContainer';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { RecordTableSettingsFiltersInitializeStateEffect } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableSettingsFiltersInitializeStateEffect';
import { RecordTableSettingsSortsContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableSettingsSortsContent';
import { RecordTableSettingsSortsInitializeStateEffect } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableSettingsSortsInitializeStateEffect';
import { TextInput } from '@/ui/input/components/TextInput';
import { InputLabel } from '@/ui/input/components/internal/InputLabel/InputLabel';
import { type View } from '@/views/types/View';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useIcons } from 'twenty-ui/icon/provider';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { ViewSortDirection } from '~/generated-metadata/graphql';

// The effects also prepare the filter rows the user adds before the scope view exists
const EMPTY_SCOPE_VIEW: Pick<
  View,
  'viewFilters' | 'viewFilterGroups' | 'viewSorts'
> = {
  viewFilters: [],
  viewFilterGroups: [],
  viewSorts: [],
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

type SidePanelEditColumnScopeSectionProps = {
  scopeInstanceId: string;
  scopeView: View | undefined;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  recordLimit: string;
  recordLimitError?: string;
  onRecordLimitChange: (recordLimit: string) => void;
};

export const SidePanelEditColumnScopeSection = ({
  scopeInstanceId,
  scopeView,
  relationObjectMetadataItem,
  recordLimit,
  recordLimitError,
  onRecordLimitChange,
}: SidePanelEditColumnScopeSectionProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const sortableFieldOptions = relationObjectMetadataItem.fields
    .filter(filterSortableFieldMetadataItems)
    .map((field) => ({
      Icon: getIcon(field.icon),
      label: field.label,
      value: field.id,
    }));

  const directionOptions: Array<SelectOption<ViewSortDirection>> = [
    { label: t`Ascending`, value: ViewSortDirection.ASC },
    { label: t`Descending`, value: ViewSortDirection.DESC },
  ];

  return (
    <StyledContainer>
      <StyledSection>
        <InputLabel>{t`Show only related records matching`}</InputLabel>
        <RecordFilterGroupsComponentInstanceContext.Provider
          value={{ instanceId: scopeInstanceId }}
        >
          <RecordFiltersComponentInstanceContext.Provider
            value={{ instanceId: scopeInstanceId }}
          >
            <AdvancedFilterSidePanelContainer
              objectMetadataItem={relationObjectMetadataItem}
              isWorkflowFindRecords={false}
            />
            <RecordTableSettingsFiltersInitializeStateEffect
              view={scopeView ?? EMPTY_SCOPE_VIEW}
            />
          </RecordFiltersComponentInstanceContext.Provider>
        </RecordFilterGroupsComponentInstanceContext.Provider>
      </StyledSection>
      <StyledSection>
        <InputLabel>{t`Order related records by`}</InputLabel>
        <RecordSortsComponentInstanceContext.Provider
          value={{ instanceId: scopeInstanceId }}
        >
          <RecordTableSettingsSortsContent
            sortableFieldOptions={sortableFieldOptions}
            directionOptions={directionOptions}
          />
          <RecordTableSettingsSortsInitializeStateEffect
            view={scopeView ?? EMPTY_SCOPE_VIEW}
          />
        </RecordSortsComponentInstanceContext.Provider>
      </StyledSection>
      <TextInput
        label={t`Show at most`}
        type="number"
        value={recordLimit}
        error={recordLimitError}
        onChange={onRecordLimitChange}
        placeholder={t`All`}
        fullWidth
      />
    </StyledContainer>
  );
};
