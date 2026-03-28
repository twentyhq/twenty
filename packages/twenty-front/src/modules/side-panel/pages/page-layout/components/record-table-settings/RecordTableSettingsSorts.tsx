import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { filterSortableFieldMetadataItems } from '@/object-metadata/utils/filterSortableFieldMetadataItems';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { RecordTableSettingsSortsContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableSettingsSortsContent';
import { RecordTableSettingsSortsInitializeStateEffect } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableSettingsSortsInitializeStateEffect';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { useViewById } from '@/views/hooks/useViewById';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { ViewSortDirection } from '~/generated-metadata/graphql';

const StyledSortSettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

type RecordTableSettingsSortsProps = {
  viewId: string;
  objectMetadataId: string;
};

export const RecordTableSettingsSorts = ({
  viewId,
  objectMetadataId,
}: RecordTableSettingsSortsProps) => {
  const { view } = useViewById(viewId);
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const { getIcon } = useIcons();

  const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
    objectMetadataItem.namePlural,
    viewId,
  );

  if (!isDefined(view)) {
    return null;
  }

  const sortableFieldOptions = objectMetadataItem.fields
    .filter(filterSortableFieldMetadataItems)
    .map((field) => ({
      Icon: getIcon(field.icon),
      label: field.label,
      value: field.id,
    }));

  const directionOptions: Array<SelectOption<ViewSortDirection>> = [
    {
      label: t`Ascending`,
      value: ViewSortDirection.ASC,
    },
    {
      label: t`Descending`,
      value: ViewSortDirection.DESC,
    },
  ];

  return (
    <StyledSortSettingsContainer>
      <InputLabel>{t`Sorts`}</InputLabel>
      <RecordSortsComponentInstanceContext.Provider
        value={{ instanceId: recordIndexId }}
      >
        <RecordTableSettingsSortsContent
          sortableFieldOptions={sortableFieldOptions}
          directionOptions={directionOptions}
        />
        <RecordTableSettingsSortsInitializeStateEffect view={view} />
      </RecordSortsComponentInstanceContext.Provider>
    </StyledSortSettingsContainer>
  );
};
